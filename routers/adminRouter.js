import express from "express";
import auth from "../middleweare/auth.js";
import admin from "../middleweare/admin.js";
import { getFinanceSummary, getMonthlySalesReport } from "../controllers/orderController.js";

const adminRouter=express.Router();
adminRouter.get('/finance-summary',auth,admin,getFinanceSummary);
adminRouter.get('/monthly-sales',auth,admin,getMonthlySalesReport);
export default adminRouter;