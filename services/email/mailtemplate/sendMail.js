
import { generateInvoicePDF } from "../../../utill/invoicePdf.js";
import transporter from "../mailer.js";
import { invoiceEmailTemplate, otpEmailTemplate, welcomeEmailTemplate } from "./mails.js";

//send welcome mails
export const sendWelcomeMail =async(user,verifyurl)=>{
    try {
        await transporter.sendMail({
            from:`"I Computers Shop" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Welcome to I Computers Shop",
            html: welcomeEmailTemplate(user, verifyurl)
        })
        
    } catch (error) {
        console.error("❌ Failed to send email:", err);
    }
}

//send OTO mails
export const sendOtpMail =async(user,otp)=>{
    try {
        await transporter.sendMail({
            from:`"I Computers Shop" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Welcome to I Computers Shop",
            html: otpEmailTemplate(user, otp)
        })
        
    } catch (error) {
        console.error("❌ Failed to send email:", err);
    }
}

//send invoice mails
export const sendInvoiceMail =async(user,order)=>{
    try {
        const pdfPath = generateInvoicePDF(order);
        await transporter.sendMail({
            from:`"I Computers Shop" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Invoice - ${order.orderId}`,
            html: invoiceEmailTemplate(user, order),
            attachments: [
                {
                    filename: `${order.orderId}.pdf`,
                    path: pdfPath,
                },
            ],
        })
        
    } catch (error) {
        console.error("❌ Failed to send email:", err);
    }
}
