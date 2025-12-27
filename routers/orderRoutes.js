import express from "express";
import auth from "../middleweare/auth.js";
import { createOrder, getAllOdres, getFinanceSummary, getMonthlySalesReport, getMyOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";
import admin from "../middleweare/admin.js";


const orderRouter = express.Router();
// User
orderRouter.post("/checkout/cart", auth, createOrder);
orderRouter.post("/checkout/buy-now", auth, createOrder);
orderRouter.get("/my-orders", auth, getMyOrders);
orderRouter.get("/get/:id",getOrderById);


// Admin
orderRouter.get("/getall", auth, admin, getAllOdres);
orderRouter.put("/status/:id", auth, admin, updateOrderStatus);
orderRouter.get('/finance-summary',auth,admin,getFinanceSummary);
orderRouter.get('/monthly-sales',auth,admin,getMonthlySalesReport);

export default orderRouter;