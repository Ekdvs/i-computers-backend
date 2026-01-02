import express from "express";
import auth from "../middleweare/auth.js";
import admin from "../middleweare/admin.js";
import { getFinanceSummary, getMonthlySalesReport } from "../controllers/orderController.js";
import { getDailyRevenue, getDashboardData, getLowStockProducts, getOrderStatusAnalytics, getPaymentMethods, getTopCustomers, getTopProducts } from "../controllers/adminController.js";
import { getAllProductsAdmin } from "../controllers/productController.js";

const adminRouter=express.Router();
adminRouter.get("/finance-summary",auth,admin, getFinanceSummary);
adminRouter.get("/monthly-sales",auth,admin,  getMonthlySalesReport);
adminRouter.get("/order-status", auth,admin, getOrderStatusAnalytics);
adminRouter.get("/low-stock", auth,admin, getLowStockProducts);
adminRouter.get("/top-products", auth,admin, getTopProducts);
adminRouter.get("/top-customers",auth,admin,  getTopCustomers);
adminRouter.get("/payment-methods", auth,admin, getPaymentMethods);
adminRouter.get("/daily-revenue", auth,admin, getDailyRevenue);
adminRouter.get('/dashboard',auth,admin,getDashboardData)
adminRouter.get('/getallproduct',auth,admin,getAllProductsAdmin)

export default adminRouter;