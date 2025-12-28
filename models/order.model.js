import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    address: String,
    phone: String,
    notes: {
      type:String,
      default:'Order placed successfully'
    },

    items: [
      {
        productID: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    subtotal: Number,
    discount: { type: Number, default: 0 },
    total: Number,

    coupon: {
      code: String,
      discountAmount: Number,
    },

    // 💰 PAYMENT
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["PAYHERE", "COD", "CARD", "BANK"],
      default: "PAYHERE",
    },
    paymentId: String,
    paidAt: Date,

    // 🚚 DELIVERY
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
