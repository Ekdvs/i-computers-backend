import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            trim: true,
        },
        discountPercent: {
            type: Number,
            required: [true, "Discount percentage is required"],
            min: 1,
            max: 100,
        },
        expiryDate: {
            type: Date,
            required: [true, "Expiry date is required"],
            },
        isActive: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            default: "",
        },
        usageLimit: {
            type: Number, 
            default: 0,   
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usersUsed: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }],

    },
    {
        timestamps: true,
    }
    
)

//auto matic expire
couponSchema.pre('save',function(next)
    {
        if(this.expiryDate<Date.now()){
            this.isActive=false;
        }
        next();
    }
)

const Coupon=mongoose.model('Coupon',couponSchema)
export default Coupon;