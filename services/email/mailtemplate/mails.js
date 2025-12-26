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



export const invoiceEmailTemplate = (user, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            ${item.name}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
            LKR ${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f5f7fb; padding:30px;">
    <div style="max-width:700px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">

      ${generateEmailHeader()}

      <!-- Body -->
      <div style="padding:30px;">
        <h2 style="margin-top:0;color:#333;">Payment Successful 🎉</h2>
        <p style="color:#555;font-size:15px;">
          Hi <strong>${user.name}</strong>,<br/><br/>
          Thank you for shopping with <strong>I Computers Shop</strong>.
          Your payment has been successfully processed.
        </p>

        <!-- Order Info -->
        <div style="margin:25px 0;">
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Payment Status:</strong>
            <span style="color:#28a745;font-weight:bold;">PAID</span>
          </p>
          <p><strong>Order Date:</strong>
            ${new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <!-- Items Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:12px;text-align:left;border-bottom:2px solid #ddd;">Item</th>
              <th style="padding:12px;text-align:center;border-bottom:2px solid #ddd;">Qty</th>
              <th style="padding:12px;text-align:right;border-bottom:2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total -->
        <div style="margin-top:25px;text-align:right;">
          <p style="font-size:18px;font-weight:bold;">
            Total: <span style="color:#007BFF;">
              LKR ${order.total.toFixed(2)}
            </span>
          </p>
        </div>

        <!-- Delivery -->
        <div style="margin-top:30px;">
          <h3 style="margin-bottom:8px;">Delivery Details</h3>
          <p style="color:#555;">
            ${order.address}<br/>
            ${order.phone}
          </p>
        </div>

        <!-- CTA -->
        <div style="margin-top:30px;text-align:center;">
          <a href="http://localhost:5173/orders"
            style="
              background:#007BFF;
              color:#ffffff;
              padding:14px 26px;
              text-decoration:none;
              border-radius:6px;
              font-size:16px;
              display:inline-block;
            ">
            View My Orders
          </a>
        </div>
      </div>

      ${generateEmailFooter()}

    </div>
  </div>
  `;
};

// Coupon email template
export const couponEmailTemplate = (userName, coupon) => {
  // Determine discount text
  const discountText =
    coupon.type === "PERCENT"
      ? `${coupon.value}% off`
      : `$${coupon.value} off`;

  // Format expiry date
  const expiry = coupon.expiryDate
    ? new Date(coupon.expiryDate).toLocaleDateString()
    : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Special Coupon</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f0f2f5;">
  <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
    ${generateEmailHeader ? generateEmailHeader() : ""}
    <div style="padding:30px 20px; text-align:center; color:#333;">
      <p>Hello <strong>${userName}</strong>,</p>
      <p>We have a special coupon just for you!</p>
      <h2 style="font-size:28px; color:#007BFF; margin:20px 0;">${coupon.code}</h2>
      <p>Get <strong>${discountText}</strong> on your next purchase.</p>
      <p>Expires on: <strong>${expiry}</strong></p>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block; margin-top:25px; padding:12px 25px; background-color:#007BFF; color:#fff; text-decoration:none; border-radius:50px; font-weight:bold;">Shop Now</a>
    </div>
    ${generateEmailFooter ? generateEmailFooter() : ""}
  </div>
</body>
</html>
  `;
};

// Coupon email template for welcome offer
export const welcomeCouponEmailTemplate = (userName, coupon) => {
  // Determine discount text
  const discountText =
    coupon.type === "PERCENT"
      ? `${coupon.value}% off`
      : `LKR ${coupon.value} off`;

  // Format expiry date
  const expiry = coupon.expiryDate
    ? new Date(coupon.expiryDate).toLocaleDateString()
    : "N/A";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Welcome to Our Store!</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f0f2f5;">
  <div style="max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
    ${typeof generateEmailHeader === "function" ? generateEmailHeader() : ""}
    <div style="padding:30px 20px; text-align:center; color:#333;">
      <h1 style="color:#007BFF; margin-bottom:20px;">Welcome to Our Store!</h1>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>As a token of our appreciation, here’s a special welcome coupon just for you:</p>
      <h2 style="font-size:28px; color:#FF5733; margin:20px 0;">${coupon.code}</h2>
      <p>Enjoy <strong>${discountText}</strong> on your first purchase.</p>
      <p>Hurry! Expires on: <strong>${expiry}</strong></p>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block; margin-top:25px; padding:12px 25px; background-color:#007BFF; color:#fff; text-decoration:none; border-radius:50px; font-weight:bold;">Start Shopping</a>
    </div>
    ${typeof generateEmailFooter === "function" ? generateEmailFooter() : ""}
  </div>
</body>
</html>
  `;
};
