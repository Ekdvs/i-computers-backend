import { request } from "express";
import Product from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import Review from "../models/review.model.js";


//create product 
export const createProduct =async(request,response)=>{
    try {
       const productData=request.body;
       const newProduct=new Product(productData);
       await newProduct.save();
       return response.status(201).json({
        message:"Product created successfully",
        error:false,
        success:true,
        data:newProduct
       }) 
        
    } catch (error) {
        console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//get all products
export const getAllProducts = async(request,response)=>{
    try {
        const userId=request.userId;
        const user=UserModel.findById(userId).select("-password");
        if(user.role=='ADMIN'){
            const products=await Product.find();
            return response.status(200).json({
                message:"Products fetched successfully",
                error:false,
                success:true,
                data:products
               }) 
        }else{
             const products=await Product.find({isAvailable:true});
            return response.status(200).json({
                message:"Products fetched successfully",
                error:false,
                success:true,
                data:products
               }) 
        }

        
    } catch (error) {
        console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//delete product by id
export const deleteProductById = async(request,response)=>{
    try {
        

        const productId=request.params.productId;

        if(!productId){
            return response.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
               }) 
        }

        const deletedProduct=await Product.findByIdAndDelete(productId);

        console.log("444444444444",deletedProduct)

        if(!deletedProduct){
            return response.status(404).json({
                message:"Product not found",
                error:true,
                success:false
               }) 
        }

        return response.status(200).json({
            message:"Product deleted successfully",
            error:false,
            success:true,
            data:deletedProduct
           })
        
    } catch (error) {
        console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//update product by id
export const updateproductById =async (request,response)=>{
    try {
        const productId=request.params.productId;
        const updateData=request.body;

        if(!productId){
            return response.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
               }) 
        }

        const product = await Product.findByIdAndUpdate(productId,updateData,{new:true});

        if(!product){
            return response.status(404).json({
                message:"Product not found",
                error:true,
                success:false
               }) 
        }

        return response.status(200).json({
            message:"Product updated successfully",
            error:false,
            success:true,
            data:product
        });
        
    } catch (error) {
        console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}

//get product by id
export const getProductById = async (request, response) => {
  try {
    const productId = request.params.productId;

    if (!productId) {
      return response.status(400).json({
        message: "Product id is required",
        error: true,
        success: false,
      });
    }

    // Find by custom productID (PID-1001)
    const product = await Product.findOne({ productID: productId });

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    //get reviews for this product
    const reviews = await Review.find({ product: product._id })
      .populate("user", "name")   // ⭐ get reviewer name
      .sort({ createdAt: -1 });

    return response.status(200).json({
      message: "Product fetched successfully",
      error: false,
      success: true,
      data: {
        product,
        reviews,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
      },
    });

  } catch (error) {
    console.error("Get product error:", error);
    return response.status(500).json({
      message: "Something went wrong during get product",
      error: true,
      success: false,
    });
  }
};


//search products
export const searchProducts = async(request,response)=>{
    try {
        const query =request.query.q;

        if(!query){
            return response.status(400).json({
                message:"Search query is required",
                error:true,
                success:false
               }) 
        }
        const products=await Product.find({
            $or:[
                {name:{$regex:query,$options:"i"}},
                {category:{$regex:query,$options:"i"}},
                {brand:{$regex:query,$options:"i"}},
                {model:{$regex:query,$options:"i"}},
                {altNames:{$elemMatch:{$regex:query,$options:"i"}}}
            ]
        });

        if(products.length===0){
            return response.status(404).json({
                message:"No products found matching the query",
                error:true,
                success:false
               }) 
        }

        return response.status(200).json({
            message:"Products retrieved successfully",
            error:false,
            success:true,
            data:products
           })
        
    } catch (error) {
        console.error("Update user error:", error);
        return response.status(500).json({
        message: "Something went wrong during update",
        error: true,
        success: false,
        });
    }
}
    
