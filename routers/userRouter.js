import express from 'express'
import { getUserData, loginUser, registerUsers, verfiyEmail } from '../controllers/userController.js';
import auth from '../middleweare/auth.js';

const userRouter=express.Router();

//registeruser
userRouter.post('/register',registerUsers);

//login
userRouter.post('/login',loginUser);

//get user data
userRouter.get('/me',auth,getUserData);

//user Email verfiy
userRouter.get("/verify-email/:code", verfiyEmail);

export default userRouter;