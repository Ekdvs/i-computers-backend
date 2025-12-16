import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";


//add to cart
export const addToCart =async(request ,response)=>{
    try {
        const userId=request.userId;
        const {productId,quantity}=request.body;

        if(!productId){
            return response.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
               }) 
        }

        const product=await Product.findById(productId);

        if(!product||product.stock<quantity){
            return response.status(404).json({
                message:"Product not found",
                error:true,
                success:false
               }) 
        }

        let cart = await Cart.findOne({user:userId});

        if(!cart){
            cart=new Cart({
                user:userId,
                items:[{product:productId,quantity}]
            });
        }else {
    const index = cart.items.findIndex(
      i => i.product.toString() === productId
    );

    if (index >= 0) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

    return response.status(200).json({
        message: "Product added to cart successfully",
        error: false,
        success: true,
        data: cart
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

//get cart by user id
export const getCartByUserId =async(request ,response)=>{
    try {
        const userId=request.userId;
        const cart = await Cart.findOne({user:userId}).populate("items.product");
        if(!cart){
            return response.status(404).json({
                message:"Cart not found",
                error:true,
                success:false
               }) 
        }
        return response.status(200).json({
            message: "Cart fetched successfully",
            error: false,
            success: true,
            data: cart
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

//delete cart item
export const deleteCartItem = async(request,response)=>{
    try {
        const userId=request.userId;
        const {productId}=request.params;

        if(!productId){
            return response.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
               }) 
        }

        const cart=await Cart.findOne({user:userId});
        if(!cart){
            return response.status(404).json({
                message:"Cart not found",
                error:true,
                success:false
               }) 
        }
         const index = cart.items.findIndex(
          i => i.product.toString() === productId
        ); 
        if (index >= 0) {
          cart.items.splice(index, 1);
          await cart.save();
            return response.status(200).json({
            message: "Product removed from cart successfully",
            error: false,
            success: true,
            data: cart
          });
        } else {
          return response.status(404).json({
            message: "Product not found in cart",
            error: true,
            success: false
          });
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

//update cart item quantity
export const updateCartItemQuantity = async(request,response)=>{
    try {
        const userId=request.userId;
        const {productId}=request.params;
        const {quantity}=request.body;
        if(!productId){
            return response.status(400).json({
                message:"Product id is required",
                error:true,
                success:false
               }) 
        }
        const cart=await Cart.findOne({user:userId});
        if(!cart){
            return response.status(404).json({
                message:"Cart not found",
                error:true,
                success:false
               }) 
        }
            const index = cart.items.findIndex(
            i => i.product.toString() === productId
            ); 
            if (index >= 0) {
            cart.items[index].quantity = quantity;
            await cart.save();
            return response.status(200).json({
                message: "Cart item quantity updated successfully",
                error: false,
                success: true,
                data: cart
            });
            }
            else {
            return response.status(404).json({
                message: "Product not found in cart",
                error: true,
                success: false
            });
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