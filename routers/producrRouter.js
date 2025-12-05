import express from 'express';
import { createProduct, deleteProductById, getAllProducts, getProductById, updateproductById,searchProducts  } from '../controllers/productController.js';
import admin from '../middleweare/admin.js';
import auth from '../middleweare/auth.js';

const productRouter = express.Router();
productRouter.get('/getall',getAllProducts);
productRouter.post('/createProduct',auth,admin,createProduct);
productRouter.put('/updateProduct/:productId',admin,updateproductById);
productRouter.delete('/deleteProduct/:productId',admin,deleteProductById);
productRouter.get('/getById/:productId',getProductById);
productRouter.get('/search',searchProducts );



export default productRouter;