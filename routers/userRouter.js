import express from 'express'
import { loginUser, registerUsers } from '../controllers/userController.js';

const userRouter=express.Router();

//registeruser
userRouter.post('/register',registerUsers);

//login
userRouter.post('/login',loginUser);

export default userRouter;