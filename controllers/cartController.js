import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity (>=1) are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // create new cart
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (index >= 0) {
        // update quantity
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // Populate product details for frontend
    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get cart by user
export const getCartByUserId = async (req, res) => {
  try {
    const userId = req.userId;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      // Return empty cart instead of 404
      return res.status(200).json({
        message: "Cart is empty",
        error: false,
        success: true,
        data: { user: userId, items: [] },
      });
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      error: false,
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
};

// Update cart quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        error: true,
        success: false,
      });
    }

    const index = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (index >= 0) {
      cart.items[index].quantity = quantity;
      await cart.save();
      return res.status(200).json({
        message: "Cart updated successfully",
        error: false,
        success: true,
        data: cart,
      });
    } else {
      return res.status(404).json({
        message: "Product not found in cart",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
};

// Delete cart item
export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        error: true,
        success: false,
      });
    }

    const index = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (index >= 0) {
      cart.items.splice(index, 1);
      await cart.save();
      return res.status(200).json({
        message: "Item removed successfully",
        error: false,
        success: true,
        data: cart,
      });
    } else {
      return res.status(404).json({
        message: "Product not found in cart",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    console.error("Delete cart error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
};
