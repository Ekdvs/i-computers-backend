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
        type:Number
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
        required:true,
        default:"Generic" 
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
    averageRating: {
         type: Number,
          default: 0
     },
    totalReviews: { 
        type: Number, 
        default: 0 
    }
    
},{
    timestamps:true
})

const Product=mongoose.model("Product",productSchema);

export default Product;