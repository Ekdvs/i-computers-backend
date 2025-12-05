
import transporter from "../mailer.js";
import { otpEmailTemplate, welcomeEmailTemplate } from "./mails.js";

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
