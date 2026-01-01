
import crypto from "crypto";
import { sendInvoiceMail } from "../services/email/mailtemplate/sendMail.js";
import UserModel from "../models/user.model.js";
import Order from "../models/order.model.js";

// Generate PayHere hash for payment initiation
export const generatePayHereHash = (
  merchant_id,
  order_id,
  amount,
  currency,
  merchant_secret
) => {
  const formattedAmount = Number(amount).toFixed(2);

  // Inner MD5 of merchant secret
  const secretHash = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();

  // Full MD5 hash
  const hash = crypto
    .createHash("md5")
    .update(merchant_id + order_id + formattedAmount + currency + secretHash)
    .digest("hex")
    .toUpperCase();

  return hash;
};

// -------------------- Initiate Payment --------------------
export const initiatePayHerePayment = async (req, res) => {
  try {
    const { orderId } = req.params; 

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID required" });
    }

    // Find order by orderId field, not _id
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const amount = Number(order.total).toFixed(2);

    const hash = generatePayHereHash(
      process.env.PAYHERE_SANDBOX_MERCHANT_ID,
      order.orderId,
      amount,
      "LKR",
      process.env.PAYHERE_SANDBOX_SECRET
    );

    const paymentData = {
      sandbox: true, // Sandbox mode
      merchant_id: process.env.PAYHERE_SANDBOX_MERCHANT_ID,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payment/payhere/notify`,

      order_id: order.orderId, 
      items: order.items.map(i => i.name).join(", "),
      amount,
      currency: "LKR",

      first_name: order.name || "Customer",
      last_name: "",
      email: order.email || "test@gmail.com",
      phone: order.phone || "0771234567",
      address: order.address || "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",

      hash
    };

    return res.json({ success: true, paymentData });

  } catch (error) {
    console.error("❌ Initiate error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- PayHere Webhook --------------------
export const handlePayHereNotification = async (req, res) => {
  try {
    console.log("🔥 PAYHERE WEBHOOK HIT");
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const order = await Order.findOne({ orderId: order_id });
    if (!order) return res.sendStatus(404);

    // VERIFY HASH
    const secretHash = crypto
      .createHash("md5")
      .update(process.env.PAYHERE_SANDBOX_SECRET)
      .digest("hex")
      .toUpperCase();

    const localHash = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          secretHash
      )
      .digest("hex")
      .toUpperCase();

    if (localHash !== md5sig) return res.sendStatus(400);

    // ✅ SUCCESS
    if (status_code === "2") {
      if (order.paymentStatus === "paid") return res.sendStatus(200);

      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.paidAt = new Date();
      order.paymentId = md5sig;

      await order.save();

      // LOCK COUPON
      if (order.coupon?.code) {
        await Coupon.findOneAndUpdate(
          { code: order.coupon.code },
          {
            $inc: { usedCount: 1 },
            $push: { usersUsed: order.user },
          }
        );
      }
      
      const userId=order.user
      //console.log('user id',userId)

      const user = await UserModel.findById(userId)
      //console.log("user",user.email)
      await sendInvoiceMail(user, order);
      return res.sendStatus(200);
    }

    // ❌ FAILED
    if (status_code === "-1") {
      order.paymentStatus = "failed";
      order.status = "cancelled";
    }

    if (status_code === "-3") {
      order.paymentStatus = "refunded";
    }

    await order.save();
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
};


