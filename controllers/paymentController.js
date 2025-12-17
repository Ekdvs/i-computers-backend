import Order from "../models/order.model.js";
import crypto from "crypto";

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
      return_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
      notify_url: "http://localhost:8080/api/payment/payhere/notify",

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
  console.log("PayHere notification received:", req.body);  
  try {
    const {
      merchant_id,
      order_id,         // PayHere sends "order_id"
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = req.body;

    // Find order by orderId field
    const order = await Order.findOne({ orderId: order_id });
    if (!order) return res.sendStatus(404);

    // Verify MD5 signature
    const secretHash = crypto
      .createHash("md5")
      .update(process.env.PAYHERE_SANDBOX_SECRET)
      .digest("hex")
      .toUpperCase();

    const localMd5 = crypto
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

    if (localMd5 !== md5sig) {
      console.error("❌ MD5 mismatch");
      console.log("Expected:", localMd5);
      console.log("Received:", md5sig);
      return res.sendStatus(400);
    }

    // Update order status
    if (status_code === "2"){ 
      order.status = "paid";
      await sendInvoiceMail(order.user, order);
    }
    else if (status_code === "0") order.status = "pending";
    else if (status_code === "-1") order.status = "cancelled";
    else if (status_code === "-2") order.status = "failed";
    else if (status_code === "-3") order.status = "refunded";
    else order.status = "failed";

    await order.save();
    return res.sendStatus(200);

  } catch (err) {
    console.error("❌ Notify error:", err);
    return res.sendStatus(500);
  }
};
