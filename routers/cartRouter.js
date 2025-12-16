import express from 'express';
import auth from '../middleweare/auth.js';
import { addToCart, deleteCartItem, getCartByUserId, updateCartItemQuantity } from '../controllers/cartController.js';

const cartRouter = express.Router();

//add item to cart
cartRouter.post('/addcart',auth,addToCart);
//get cart items
cartRouter.get('/getcart',auth,getCartByUserId);
//update cart item quantity
cartRouter.put('/updatecart/:productId',auth,updateCartItemQuantity);
//remove item from cart
cartRouter.delete('/deletecart/:productId',auth,deleteCartItem);

export default cartRouter;