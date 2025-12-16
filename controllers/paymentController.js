import Order from "../models/order.model.js";
import { generatePayHereHash } from "../utill/payhere.js";

//initiate payment
export const initiatePayHerePayment = async(request,response)=>{
    try {
        const {oderId} =request.params;

        if(!oderId){
            return response.status(400).json({
                message:"Order id is required",
                error:true,
                success:false
               }) 
        }

        const order=await Order.findById(oderId);

        if(!order){
            return response.status(404).json({
                message:"Order not found",
                error:true,
                success:false
            }) 
        }

        const hash=generatePayHereHash(
            process.env.PAYHERE_MERCHANT_ID,
            order.orderId,
            order.total,
            "LKR",
            process.env.PAYHERE_SECRET
        )
        return response.status(200).json({
            message:"Payment initiated successfully",
            error:false,
            hash:{
                merchant_id: process.env.PAYHERE_MERCHANT_ID,
                    return_url: process.env.PAYHERE_RETURN_URL,
                    cancel_url: process.env.PAYHERE_CANCEL_URL,
                    notify_url: process.env.PAYHERE_NOTIFY_URL,
                    order_id: order.orderId,
                    items: "Computer Products",
                    amount: order.total,
                    currency: "LKR",
                    first_name: order.name,
                    email: order.email,
                    phone: order.phone,
                    address: order.address,
                    country: "Sri Lanka",
                    hash
            }
        })

    } catch (error) {
        console.error("Initiate payment error:", error);
        return response.status(500).json({
        message: "Something went wrong during payment initiation",
        error: true,
        success: false,
        });
    }
}

//handle payhere payment notification
export const handlePayHereNotification = async(request,response)=>{
    try {
        const{orderId, status_code, md5sig}=request.body;

        if(!orderId ||!status_code||!md5sig){
            return response.status(400).json({
                message:"Invalid notification data",
                error:true,
                success:false
               }) 
        }
        const order=await Order.findOne({orderId:orderId});

        if(!order){
            return response.status(404).json({
                message:"Order not found",
                error:true,
                success:false
            }) 
        }
        //verify md5sig
        const expectedMd5sig=crypto.createHash('md5')
        .update(
            process.env.PAYHERE_MERCHANT_ID+
            orderId+
            status_code+
            order.total+
            "LKR"+
            process.env.PAYHERE_SECRET
        )
        .digest('hex');
        if(expectedMd5sig!==md5sig){
            return response.status(400).json({
                message:"Invalid md5 signature",
                error:true,
                success:false
               }) 
        }
        //update order status based on status_code
        if(status_code==="2"){
            order.status="Paid";
        }else if(status_code==="0"){
            order.status="Pending";
        }else{
            order.status="Failed";
        }
        await order.save();
        return response.status(200).json({
            message:"Payment notification handled successfully",
            error:false,
            success:true
        }); 

    } catch (error) {
        console.error("Handle payment notification error:", error);
        return response.status(500).json({
        message: "Something went wrong during payment notification handling",
        error: true,
        success: false,
        });
    }
}