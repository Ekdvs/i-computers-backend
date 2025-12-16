import crypto from "crypto";

export const generatePayHereHash = (
  merchant_id,
  order_id,
  amount,
  currency,
  merchant_secret
) => {
  const secretHash = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex");

  return crypto
    .createHash("md5")
    .update(
      merchant_id +
        order_id +
        amount.toFixed(2) +
        currency +
        secretHash
    )
    .digest("hex")
    .toUpperCase();
};
