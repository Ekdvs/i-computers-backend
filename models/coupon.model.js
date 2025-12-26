import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  
  type: {
    type: String,
    enum: ["PERCENT", "FLAT"],
    required: true,
  },

  value: {
    type: Number,
    required: true,
  },

  minOrderAmount: {
    type: Number,
    default: 0,
  },

  expiryDate: Date,
  isActive: { type: Boolean, default: true },

  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

couponSchema.pre("save", function (next) {
  if (this.expiryDate && this.expiryDate < Date.now()) {
    this.isActive = false;
  }
  next();
});

const Coupon=mongoose.model('Coupon',couponSchema)
export default Coupon;