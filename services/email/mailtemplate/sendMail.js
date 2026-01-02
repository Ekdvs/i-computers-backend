import fs from "fs";
import resend from "../mailer.js";
import { generateInvoicePDF } from "../../../utill/invoicePdf.js";
import {
  couponEmailTemplate,
  invoiceEmailTemplate,
  otpEmailTemplate,
  replyEmailTemplate,
  welcomeEmailTemplate,
} from "./mails.js";

/* -------------------- Welcome Email -------------------- */
export const sendWelcomeMail = async (user, verifyurl) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: "Welcome to I Computers Shop",
      html: welcomeEmailTemplate(user, verifyurl),
    });
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err);
  }
};

/* -------------------- OTP Email -------------------- */
export const sendOtpMail = async (user, otp) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: "Your OTP Code",
      html: otpEmailTemplate(user, otp),
    });
    console.log(`✅ OTP sent to ${user.email}`);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
  }
};

/* -------------------- Invoice Email (PDF Attachment) -------------------- */
export const sendInvoiceMail = async (user, order) => {
  try {
    // 1️⃣ Generate PDF
    const pdfPath = await generateInvoicePDF(order);

    // 2️⃣ Read file as buffer
    const pdfBuffer = fs.readFileSync(pdfPath);

    // 3️⃣ Send email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: `Invoice - ${order.orderId}`,
      html: invoiceEmailTemplate(user, order),
      attachments: [
        {
          filename: `${order.orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log(`✅ Invoice sent to ${user.email}`);

    // 4️⃣ Delete PDF
    fs.unlinkSync(pdfPath);
  } catch (err) {
    console.error("❌ Failed to send invoice email:", err);
  }
};

/* -------------------- Coupon to Many Users -------------------- */
export const sendCoupon = async (emailList, username, coupon) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: emailList, // array supported
      subject: "We have a special coupon just for you!",
      html: couponEmailTemplate(username, coupon),
    });
  } catch (err) {
    console.error("❌ Failed to send coupon email:", err);
  }
};

/* -------------------- Welcome Offer -------------------- */
export const sendWelcomeOffer = async (newUser, coupon) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: newUser.email,
      subject: "Welcome! Here’s your special coupon 🎁",
      html: couponEmailTemplate(newUser.name, coupon),
    });
  } catch (err) {
    console.error("❌ Failed to send welcome offer:", err);
  }
};

/* -------------------- Reply Email -------------------- */
export const sendReplyMail = async (email, subject, reply, name) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: `Re: ${subject}`,
      html: replyEmailTemplate(name, reply),
    });
  } catch (err) {
    console.error("❌ Failed to send reply email:", err);
  }
};
