import express from "express";
import auth from "../middleweare/auth.js";
import admin from "../middleweare/admin.js";
import { getFinanceSummary, getMonthlySalesReport } from "../controllers/orderController.js";
import { getDailyRevenue, getDashboardData, getLowStockProducts, getOrderStatusAnalytics, getPaymentMethods, getTopCustomers, getTopProducts } from "../controllers/adminController.js";

const adminRouter=express.Router();
adminRouter.get("/finance-summary", getFinanceSummary);
adminRouter.get("/monthly-sales", getMonthlySalesReport);
adminRouter.get("/order-status", getOrderStatusAnalytics);
adminRouter.get("/low-stock", getLowStockProducts);
adminRouter.get("/top-products", getTopProducts);
adminRouter.get("/top-customers", getTopCustomers);
adminRouter.get("/payment-methods", getPaymentMethods);
adminRouter.get("/daily-revenue", getDailyRevenue);
adminRouter.get('/dashboard',auth,admin,getDashboardData)
export default adminRouter;