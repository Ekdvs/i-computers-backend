import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: String,
    notes: String,
    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },
    coupon: {
      code: String,
      discountPercent: Number,
      discountAmount: Number,
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      default: "PAYHERE"
    },
    items: [
      {
        productID: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ]
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
