
import { generateInvoicePDF } from "../../../utill/invoicePdf.js";
import transporter from "../mailer.js";
import { couponEmailTemplate, invoiceEmailTemplate, otpEmailTemplate, welcomeEmailTemplate } from "./mails.js";

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
        const pdfPath = await generateInvoicePDF(order);
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
        console.error("❌ Failed to send email:", error);
    }
}

export const sendCoupon = async (emailList, username, coupon) => {
  try {
    await  transporter.sendMail({
      from: `"Online Shopping" <${process.env.EMAIL_USER}>`,
      to: emailList,
      subject: "We have a special coupon just for you!",
      html: couponEmailTemplate(username, coupon), // 🔥 Import template
    });
    //console.log("✅ coupon email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};

export const sendWelcomeOffer = async (newUser, coupon) => {
  try {
    await  transporter.sendMail({
      from: `"Online Shopping" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "We have a special coupon just for you!",
      html: couponEmailTemplate(newUser.name, coupon), // 🔥 Import template
    });
    console.log("✅ coupon email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};

