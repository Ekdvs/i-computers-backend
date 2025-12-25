import express from "express";
import auth from "../middleweare/auth.js";
import { handlePayHereNotification, initiatePayHerePayment } from "../controllers/paymentController.js";

const paymentRoutes=express.Router();

paymentRoutes.get('/payhere/initiate/:orderId',initiatePayHerePayment)
paymentRoutes.get('/payhere/notify',handlePayHereNotification)

export default paymentRoutes;