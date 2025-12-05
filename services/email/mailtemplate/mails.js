// emailTemplates.js

// Email Header
export const generateEmailHeader = () => `
  <div style="
    background-color: #007BFF;
    color: #fff;
    text-align: center;
    padding: 25px 20px;
    font-size: 28px;
    font-weight: bold;
  ">
    I Computers Shop
  </div>
`;

// Email Footer
export const generateEmailFooter = () => `
  <div style="
    background-color: #f0f2f5;
    color: #888888;
    text-align: center;
    padding: 20px;
    font-size: 14px;
  ">
    &copy; ${new Date().getFullYear()} I Computers Shop. All rights reserved.<br/>
    123 Your Street, Your City, Country
  </div>
`;

// Welcome Email Template
export const welcomeEmailTemplate = (user, url) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Welcome to I Computers Shop</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f7;">
  <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
    ${generateEmailHeader()}
    <div style="padding:30px 20px; color:#333; text-align:center;">
      <h1 style="color:#007BFF; margin-bottom:15px;">Hello, ${user.name}!</h1>
      <p>Welcome to <strong>I Computers Shop</strong> — your trusted place for computers, accessories, and tech solutions.</p>
      <p>Please verify your email to get started.</p>
      <a href="${url}" style="display:inline-block; margin-top:20px; padding:12px 25px; background-color:#28a745; color:#fff; text-decoration:none; border-radius:50px; font-weight:bold;">Verify Email</a>
      <p style="margin-top:25px;">If you have any questions, our support team is always here for you.</p>
    </div>
    ${generateEmailFooter()}
  </div>
</body>
</html>
`;

// OTP Email Template
export const otpEmailTemplate = (user, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Password Reset OTP</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f0f2f5;">
  <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
    ${generateEmailHeader()}
    <div style="padding:30px 20px; text-align:center; color:#333;">
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>You requested to reset your password for your <strong>I Computers Shop</strong> account.</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h2 style="font-size:36px; color:#007BFF; margin:20px 0;">${otp}</h2>
      <p>This OTP is valid for <strong>5 minutes</strong>. Please use it to reset your password.</p>
      <a href="#" style="display:inline-block; margin-top:25px; padding:12px 25px; background-color:#007BFF; color:#fff; text-decoration:none; border-radius:50px; font-weight:bold;">Reset Password</a>
    </div>
    ${generateEmailFooter()}
  </div>
</body>
</html>
`;
