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

//get all user products
export const getAllProducts = async (req, res) => {
  try {
    // pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    // public users see only available products
    const filter = {
    isAvailable: true,
    stock: { $gt: 0 }
    };


    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      error: false,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: true,
    });
  }
};

//admin getall products
export const getAllProductsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({})
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      error: false,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Admin get products error:", error);
    res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
    });
  }
};


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
    
