import express from "express";
import auth from "../middleweare/auth.js";
import admin from '../middleweare/admin.js';
import { addReview, deleteReview, getAllReviews, getReviews, getUserReviews, updateReview } from "../controllers/reviewController.js";


const ratingRouter=express.Router();

//add review
ratingRouter.post('/create',auth,addReview);

//get all reviews
ratingRouter.get('/getall/:productId',getReviews)

//update 
ratingRouter.put('/update/:reviewId',auth,updateReview)

//delete rating 
ratingRouter.delete("/delete/:reviewId", auth,admin, deleteReview); 

//get all reviews for admin
ratingRouter.get("/admin/getall", auth, admin, getAllReviews);

//get user reviews
ratingRouter.get('/user/:userId',auth,getUserReviews)

export default ratingRouter;