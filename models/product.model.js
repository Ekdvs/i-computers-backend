import mongoose from "mongoose";


const productSchema=new mongoose.Schema({
    productID:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    altNames:{
        type:[String],
        default:[]
    },
    price:{
        type:Number,
        required:true
    },
    labeledPrice:{
        type:Number,
        required:true
    },
    image:{
        type:[String],
        required:true
    },
    category:{
        type:String,
        required:true
    },
    model:{
        type:String,
        required:true,
        default:"Standard"
    },
    brand:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true,
        default:0
    },
    description:{
        type:String,
        required:true
    },
    isAvailable:{
        type:Boolean,
        required:true,
        default:true
    },
    ratings:{
        type:Number,
        required:true,
        default:0
    },
    numOfReviews:{
        type:Number,
        required:true,
        default:0
    },
    coments:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Review",
        default:[]
    }
},{
    timestamps:true
})

const Product=mongoose.model("Product",productSchema);

export default Product;