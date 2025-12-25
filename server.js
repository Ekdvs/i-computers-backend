import dotenv from "dotenv"
import express from "express"
import connectDB from "./configs/db.js";
import userRouter from "./routers/userRouter.js";
import cors from "cors";
import productRouter from "./routers/producrRouter.js";
import cartRouter from "./routers/cartRouter.js";
import ratingRouter from "./routers/ratingRouter.js";
import orderRouter from "./routers/orderRoutes.js";
import paymentRoutes from "./routers/paymentRoutes.js";
import couponRouter from "./routers/couponRouter.js";


dotenv.config();
const app=express()

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, })
);

//add midlware
app.use(express.json());
app.use(express.urlencoded({extended:true}))

// ✅ API routes
app.use("/api/user", userRouter);
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/rating',ratingRouter)
app.use('/api/order',orderRouter)
app.use('/api/payment',paymentRoutes)
app.use("/api/coupon", couponRouter);

//create port
connectDB().then(()=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log("🚀 Server running on port", process.env.PORT || 5000)
    })
})