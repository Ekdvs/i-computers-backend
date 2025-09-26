import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt'

//register user
export const registerUsers=async(request,response)=>{
    try {
        //get data
        const {name,email,password}=request.body;
        if(!name||!email||!password){
            return response.status(400).json({
                message:'All field are required',
                error:true,
                success:false
            })
        }

        //check email unique
        const existingUser= await UserModel.findOne({email})

        if(existingUser){
            return response.status(400).json({
                message:'User already exists Use another Email',
                error:true,
                success:false
            })
        }

        //password hashed
        const hashedPassword = await bcrypt.hash(password,16);

        //create payload
        const payload={
            name,
            email,
            password:hashedPassword
        }
        
        //save data base
        const newUser=await new UserModel(payload).save();

        //send email verifylink
        const verifyurl=`${process.env.FRONTEND_URL}/verify-email?code=${newUser?._id}`;

        return response.status(201).json({
            message:'User Registered Successfully',
            data:newUser,
            error:false,
            success:true
        })
    } catch (error) {
        console.log(error.message)
        return response.status(500).json({
            message:'Internal sever error',
            error:true,
            success:false
            
        })
    }
}