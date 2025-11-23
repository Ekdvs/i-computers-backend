import express from 'express'
import { getUserData, googleLogin, loginUser, registerUsers, verfiyEmail } from '../controllers/userController.js';
import auth from '../middleweare/auth.js';

const userRouter=express.Router();

//registeruser
userRouter.post('/register',registerUsers);

//login
userRouter.post('/login',loginUser);

//get user data
userRouter.get('/me',auth,getUserData);

//user Email verfiy
userRouter.post("/verify-email/:code", verfiyEmail);

//user google login
userRouter.post('/google-login',googleLogin);

export default userRouter;