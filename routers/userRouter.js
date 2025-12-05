import express from 'express'
import { forgotPassword, getUserData, googleLogin, loginUser, logoutUser, registerUsers, resetPassword, updateUsers, verfiyEmail, verifyForgotPasswordOtp } from '../controllers/userController.js';
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

//user forgot password
userRouter.get('/forgot-password/:email',forgotPassword)

//verify forgot password otp
userRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);

//logout user
userRouter.post('/logout',auth,logoutUser);

//update user profile
userRouter.put('/update-profile',auth,updateUsers);

//reset password
userRouter.put('/reset-password',resetPassword);



export default userRouter;