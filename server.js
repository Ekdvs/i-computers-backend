import dotenv from "dotenv"
import express from "express"
import connectDB from "./configs/db.js";
import userRouter from "./routers/userRouter.js";
import cors from "cors";


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

//create port
connectDB().then(()=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log("🚀 Server running on port", process.env.PORT || 5000)
    })
})