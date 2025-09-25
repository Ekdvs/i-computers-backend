import dotenv from "dotenv"
import express from "express"

dotenv.config();
const app=express()

//add midlware
app.use(express.json());
app.use(express.urlencoded({extended:true}))