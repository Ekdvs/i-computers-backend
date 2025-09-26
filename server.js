import dotenv from "dotenv"
import express from "express"
import connectDB from "./configs/db.js";

dotenv.config();
const app=express()

//add midlware
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//create port
connectDB().then(()=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log("🚀 Server running on port", process.env.PORT || 5000)
    })
})