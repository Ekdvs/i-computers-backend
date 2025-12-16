import express from "express";
import auth from "../middleweare/auth.js";
import { handlePayHereNotification, initiatePayHerePayment } from "../controllers/paymentController.js";

const paymentRoutes=express.Router();

paymentRoutes.get('/payhere/initiate',auth,initiatePayHerePayment)
paymentRoutes.post('/payhere/notify',handlePayHereNotification)

export default paymentRoutes;