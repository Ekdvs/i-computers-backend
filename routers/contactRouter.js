import express from 'express'
import { createMessage, getAllMessage, messageDelete, messageRead, messageReply } from '../controllers/contactController.js'
import auth from '../middleweare/auth.js';
import admin from '../middleweare/admin.js';

const contactRouter = express.Router()

contactRouter.post('/create',createMessage);
contactRouter.get('/getall',auth,admin, getAllMessage)
contactRouter.delete('/delete/:id',auth,admin,messageDelete)
contactRouter.put('/read/:id',auth,admin,messageRead)
contactRouter.post('/reply/:id',auth,admin,messageReply)

export default contactRouter