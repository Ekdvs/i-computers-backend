import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
    {
       name: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },
        subject: { 
            type: String, 
            required: true 
        },
        message: { 
            type: String, 
            required: true 
        },
        isRead: { 
            type: Boolean, 
            default: false 
        },
        isReplied: { 
            type: Boolean, 
            default: false 
        },
        adminReply: { 
            type: String 
        },
    },
    { timestamps: true }
)

const ContactMessage = mongoose.model('ContactMessage',contactMessageSchema)
export default ContactMessage