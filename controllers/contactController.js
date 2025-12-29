import ContactMessage from "../models/contact.model.js";
import mongoose from "mongoose";
import { sendReplyMail } from "../services/email/mailtemplate/sendMail.js";

//create contact message
export const createMessage = async(request,response)=>{
    try {
        const message= await ContactMessage.create(request.body);
        return response.status(201).json(
            {
                success:true,
                error:false,
                message:"Message sent successfully",
                data:message
            }
        )
        
    } catch (error) {
        console.error("Create Message error:", error);
        return response.status(500).json({
        success: false,
        message: "Failed to Create Message",
        });
    }
}

//get all message for admin
export const getAllMessage = async(request,response)=>{
    try {
        const message = await ContactMessage.find().sort({createdAt:-1})  
        return response.status(201).json(
            {
                success:true,
                error:false,
                message:"Messages Featching successfully",
                data:message
            }
        )

    } catch (error) {
        console.error("feaching all Message error:", error);
        return response.status(500).json({
        success: false,
        message: "Failed to feaching all Message",
        });
    }
}

//mark as read
export const messageRead = async (request, response) => {
  try {
    const messageId = request.params.id;

    if (!messageId) {
      return response.status(400).json({
        success: false,
        message: "Message ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return response.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return response.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message,
    });
  } catch (error) {
    console.error("message read error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to mark message as read",
    });
  }
};

//mark as delete
export const messageDelete = async (request, response) => {
  try {
    const messageId = request.params.id;

    if (!messageId) {
      return response.status(400).json({
        success: false,
        message: "Message id is required",
      });
    }

    const message = await ContactMessage.findByIdAndDelete(messageId);

    if (!message) {
      return response.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("message delete error:", error);
    return response.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};


//send reply
export const messageReply = async(request,response)=>{
    try {

        const {reply}=request.body
        const messageId = request.params.id

        if(!reply||!messageId){
             return response.status(404).json({
            success: false,
            message: "Reply and Message id is requried",
             })
        }

        const message = await ContactMessage.findById(messageId)

        message.isReplied = true
        message.adminReply = reply
        message.isRead = true

        await message.save()

        await sendReplyMail(message.email,message.subject,reply,message.name)

        if(!message){
             return response.status(404).json({
            success: false,
            message: "Message Not Found",
             })
        }
        return response.status(201).json(
            {
                success: true,
                message: "Message send reply successfully",
                data:message,
            }
        )


        
    } catch (error) {
        console.error("message send reply error:", error);
        return response.status(500).json({
        success: false,
        message: "Failed to message send reply",
        });
    }
}