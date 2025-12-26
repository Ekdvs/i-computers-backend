import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import { sendCoupon } from "../services/email/mailtemplate/sendMail.js";

// ===============================
// CREATE COUPON
// ===============================
export const createCoupon = async (request, response) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      expiryDate,
      usageLimit,
    } = request.body;

    // Validate required fields
    if (!code || !type || !value || !expiryDate) {
      return response.status(400).json({
        success: false,
        message: "Code, type, value and expiry date are required",
      });
    }

    if (!["PERCENT", "FLAT"].includes(type)) {
      return response.status(400).json({
        success: false,
        message: "Invalid coupon type",
      });
    }

    if (type === "PERCENT" && (value <= 0 || value > 100)) {
      return response.status(400).json({
        success: false,
        message: "Percent value must be between 1 and 100",
      });
    }

    if (type === "FLAT" && value <= 0) {
      return response.status(400).json({
        success: false,
        message: "Flat discount must be greater than 0",
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
      usageLimit: usageLimit || 0,
      isActive: true,
    });



    await coupon.save();

    // Fetch all users' emails from the database
    const users = await UserModel.find().select("email username");
    const emailList = users.map(user => user.email);
    
    
    // Send coupon email to all users
    if (emailList.length > 0) {
      for (const user of users) {
        await sendCoupon([user.email], user.username, coupon);
        
      }
      //console.log(`✅ Coupon email sent to ${emailList.length} users`);
    }

    return response.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL COUPONS
// ===============================
export const getCoupons = async (request, response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return response.status(200).json({
      success: true,
      message: "Coupons retrieved successfully",
      data: coupons,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE COUPON
// ===============================
export const updateCoupon = async (request, response) => {
  try {
    const { id } = request.params;
    const updates = request.body;

    if (updates.type && !["PERCENT", "FLAT"].includes(updates.type)) {
      return response.status(400).json({
        success: false,
        message: "Invalid coupon type",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return response.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE COUPON
// ===============================
export const deleteCoupon = async (request, response) => {
  try {
    const { id } = request.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return response.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//apply coupon code
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const { couponCode, items } = req.body;

    if (!couponCode || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and items are required",
      });
    }

    // =========================
    // 1️⃣ Calculate subtotal (SERVER SIDE)
    // =========================
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart",
        });
      }
      subtotal += product.price * item.quantity;
    }

    // =========================
    // 2️⃣ Validate coupon
    // =========================
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    if (coupon.usersUsed.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Coupon already used by you",
      });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order LKR ${coupon.minOrderAmount} required`,
      });
    }

    // =========================
    // 3️⃣ Calculate discount
    // =========================
    let discount = 0;

    if (coupon.type === "PERCENT") {
      discount = (subtotal * coupon.value) / 100;
    }

    if (coupon.type === "FLAT") {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);

    coupon.usedCount += 1;
    coupon.usersUsed.push(userId);
    await coupon.save();

    // =========================
    // 4️⃣ Return preview
    // =========================
    return res.status(200).json({
      success: true,
      subtotal,
      discount,
      total: subtotal - discount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
    });
  }
};