import { request } from "express";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { nanoid } from "nanoid";


//create order cart->checkout
export const createOrder =async(request,response)=>{
    try {
        const userId=request.userId;
        const {address ,phone,notes,name} = request.body;

        const cart=await Cart.findOne({user:userId}).populate("items.product","name price image");
        if(!cart||cart.items.length===0){
            return response.status(400).json({
                message:"Cart is empty",
                error:true,
                success:false
               }) 
        }
        let total=0;
        const items=cart.items.map((item)=>{
            total+=item.product.price*item.quantity;
            return {
                productID:item.product._id,
                name:item.product.name,
                price:item.product.price,
                quantity:item.quantity,
                image:item.product.image
            }
        });

        const order = await Order.create({
        orderId: `ORD-${nanoid(10)}`,
        user: userId,
        email: req.user.email,
        name,
        address,
        phone,
        notes,
        total,
        items
    });

    //reduce stock quantity
     for (let i of cart.items) {
      await Product.findByIdAndUpdate(i.product._id, {
        $inc: { stock: -i.quantity }
      });
    }
        // Clear the cart
        await Cart.findOneAndDelete({ user: userId });

        return response.status(200).json({
            message: "Order created successfully",
            data: order,
            success: true
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

//create order buy->checkout
export const createOrderBuyNow = async(request,response)=>{
    try {
        
        const userId=request.userId;
        const {productId,quantity,address ,phone,notes,name} = request.body;
        console.log("createOrderBuyNow called with:", {productId});

        if(!productId||!quantity){
            return response.status(400).json({
                message:"Product id and quantity are required",
                error:true,
                success:false
               }) 
        }

        const product=await Product.findById(productId);
        if(!product||product.stock<quantity){
            return response.status(404).json({
                message:"Product not found or insufficient stock",
                error:true,
                success:false
               }) 
        }
        const total=product.price*quantity;

        const order = await Order.create({
        orderId: `ORD-${nanoid(10)}`,
      user: userId,
      email:request.user.email,
      name:request.user.name,
      address,
      phone,
      notes,
      total,
      items: [
        {
          productID: product.productID,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image[0]
        }
      ]
        })

        //reduce stock quantity
        await Product.findByIdAndUpdate(productId, {
              $inc: { stock: -quantity }
            });
        
        return response.status(200).json({
            message: "Order created successfully",
            data: order,
            success: true
        });

    } catch (error) {
        console.error("Create order buy now error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

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

//update order status
export const updateOrderStatus =async(request,response)=>{
    try {
        const {id} = request.params;
        const {status} = request.body;

        const order = await Order.findByIdAndUpdate(id, {status}, {new: true});

        if(!order){
            return response.status(404).json({
                message:"Order not found",
                error:true,
                success:false
               }) 
        }

        return response.status(200).json({
            message:"Order status updated successfully",
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

//finace summary
export const getFinanceSummary = async(request,response)=>{
    try {
        const totalRevenue= await Order.aggregate([
            {
                $match:{status:"Paid"}
            },
            {
                $group:{
                    _id:null,
                    totalAmount:{$sum:"$total"}
                }
            }
        ]);

        const totalOrders = await Order.countDocuments();
        const paidOrders = await Order.countDocuments({ status: "paid" });
        const pendingOrders = await Order.countDocuments({ status: "pending" });

        return response.status(200).json({
            message:"Finance summary fetched successfully",
            data:{totalRevenue, totalOrders, paidOrders, pendingOrders},
            success:true,
            error:false
        });

    } catch (error) {
        console.error("getFinanceSummary error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//monthly sales report
export const getMonthlySalesReport = async(request,response)=>{
    try {
        
        const monthlySales= await Order.aggregate([
            {
                $match:{status:"Paid"}
            },
            {
                $group:{
                    _id:{ $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    totalAmount: { $sum: "$total" },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        return response.status(200).json({
            message:"Monthly sales report fetched successfully",
            data:{monthlySales},
            success:true,
            error:false
        });

    } catch (error) {
        console.error("getMonthly Summary error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}
