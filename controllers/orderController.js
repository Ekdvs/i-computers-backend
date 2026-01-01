import { request } from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { nanoid } from "nanoid";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";


export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address, phone, couponCode,name ,shippingCost = 100 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items to order" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product || product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `${item.name} out of stock` });

      subtotal += product.price * item.quantity;

      orderItems.push({
        productID: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image?.[0] || "",
      });

      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    // Apply coupon
    let discount = 0;
    let couponSnapshot = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (coupon && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) && !coupon.usersUsed.includes(userId)) {
        if (subtotal >= coupon.minOrderAmount) {
          discount = coupon.type === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
          discount = Math.min(discount, subtotal);

          coupon.usedCount = (coupon.usedCount || 0) + 1;
          coupon.usersUsed.push(userId);
          await coupon.save();

          couponSnapshot = {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount: discount,
          };
        }
      }
    }

    const total = Math.max(subtotal - discount+ shippingCost, 0);

    const order = await Order.create({
      orderId: `ORD-${nanoid(10)}`,
      user: userId,
      items: orderItems,
      address,
      phone,
      subtotal,
      discount,
      shippingCost,
      total,
      name,
      coupon: couponSnapshot,
      paymentStatus: "pending",
      paymentMethod: "PAYHERE",
      status: "pending",
    });

    // Clear cart if checkout from cart
    await Cart.findOneAndDelete({ user: userId });

    return res.status(201).json({ success: true, data: order, message: "Order created" });
  } catch (error) {
    console.error("❌ Create order error:", error);
    return res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

//get orders by user id
export const getMyOrders = async(request,response)=>{
    try {

        const userId=request.userId;

        const orders=await Order.find({user:userId}).sort({createdAt:-1});

        if(!orders||orders.length===0){
            return response.status(404).json({
                message:"No orders found",
                error:true,
                success:false
               }) 
        }
        return response.status(200).json({
            message:"Orders fetched successfully",
            data:orders,
            success:true,
            error:false
        });
        
    } catch (error) {
         console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//get order by id
export const getOrderById = async(request,response)=>{
    try {
        const orderId=request.params.id;
    
        const order=await Order.findOne({orderId:orderId}).populate("user","name email");

        if(!order){
            return response.status(404).json({
                message:"Order not found",
                error:true,
                success:false
               }) 
        }

        return response.status(200).json({
            message:"Order fetched successfully",
            data:order,
            success:true,
            error:false
        }); 
        
    } catch (error) {
         console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//get all orders for admin
export const getAllOdres =async(request,response)=>{
    try {
        const orders=await Order.find().populate("user","name email").sort({createdAt:-1});

        if(!orders||orders.length===0){
            return response.status(404).json({
                message:"No orders found",
                error:true,
                success:false
               }) 
        }
        return response.status(200).json({
            message:"Orders fetched successfully",
            data:orders,
            success:true,
            error:false
        });
        
    } catch (error) {
         console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

// update order status & note (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const update = {};
    if (status) update.status = status;
    if (note !== undefined) update.note = note;

    const order = await Order.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};



//finace summary
export const getFinanceSummary = async (req, res) => {
  try {
    const [
      revenue,
      totalOrders,
      paidOrders,
      pendingOrders,
      refundedOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ paymentStatus: "pending" }),
      Order.countDocuments({ paymentStatus: "refunded" }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.total || 0,
        totalOrders,
        paidOrders,
        pendingOrders,
        refundedOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Finance summary failed",
    });
  }
};



//monthly sales report
export const getMonthlySalesReport = async (req, res) => {
  try {
    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: "delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: monthlySales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Monthly sales failed",
    });
  }
};

