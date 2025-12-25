import express from "express";
import auth from "../middleweare/auth.js";
import admin from "../middleweare/admin.js";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "../controllers/couponController.js";


const couponRouter = express.Router();

//coupon create
couponRouter.post("/create", auth, admin, createCoupon);

//coupon get all
couponRouter.get("/getall", auth,admin, getCoupons);

//coupon update
couponRouter.put("/update/:id", auth, admin, updateCoupon);

//coupon delete
couponRouter.delete("/delete/:id", auth,admin, deleteCoupon);

// User apply
//couponRouter.post("/apply", auth, applyDiscount);

export default couponRouter;