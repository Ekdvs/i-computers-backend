import express from "express";
import auth from "../middleweare/auth.js";
import { createOrder, createOrderBuyNow, getAllOdres, getFinanceSummary, getMonthlySalesReport, getMyOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";
import admin from "../middleweare/admin.js";


const orderRouter = express.Router();
// User
orderRouter.post("/checkout/cart", auth, createOrder);
orderRouter.post("/checkout/buy-now", auth, createOrderBuyNow);
orderRouter.get("/my-orders", auth, getMyOrders);
orderRouter.get("/get/:id",getOrderById);


// Admin
orderRouter.get("/", auth, admin, getAllOdres);
orderRouter.put("/:id/status", auth, admin, updateOrderStatus);
orderRouter.get('/finance-summary',auth,admin,getFinanceSummary);
orderRouter.get('/monthly-sales',auth,admin,getMonthlySalesReport);

export default orderRouter;