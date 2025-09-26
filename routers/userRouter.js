import express from 'express'
import { getUserData, loginUser, registerUsers } from '../controllers/userController.js';
import auth from '../middleweare/auth.js';

const userRouter=express.Router();

//registeruser
userRouter.post('/register',registerUsers);

//login
userRouter.post('/login',loginUser);

//get user data
userRouter.get('/me',auth,getUserData);

export default userRouter;