import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt'
import generatedAccesToken from "../utill/generatedAccesToken.js";
import generatedRefreshToken from "../utill/generatedRefreshToken.js";

// Use same config for login & logout
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "None", // allow cross-site cookies
  path: "/", // very important for clearing
};

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

//login user
export const loginUser=async(request,response)=>{
    try {
        const{email,password}=request.body;
        //check email and password empty
        if(!email||!password){
            return response.status(400).json({
                message:'All Fields are required',
                error:true,
                success:false
            })
        }

        //find user in data base
        const user=await UserModel.findOne({email});
        if(!user){
            return response.status(400).json({
                message:'User not Registered',
                error:true,
                success:false
            });
        }

        //check user status is ACTIVE
        if(user.status!=="ACTIVE"){
             return response.status(400).json({
                message:'User is inative',
                error:true,
                success:false
            });
        }

        //check email verfiy
        if(!user.verify_email){
            return response.status(400).json({
                message:'Please verify your email before logging in',
                error:true,
                success:false
            });
        }

        //verify password
        const checkpassword=await bcrypt.compareSync(password,user.password)
        if(!checkpassword){
            return response.status(400).json({
                message:'Invalid Credentials (Incorrect password)',
                error:true,
                success:false
            });
        }

        //access and refesh token create
        const accessToken=await generatedAccesToken(user);
        const refreshToken=await generatedRefreshToken(user._id);

        //update last login 
        const updateUser=await UserModel.findOneAndUpdate(user._id,{
            last_lagin_date: new Date()
        },{new:true}
        )

        //add to token to cokies
        response.cookie("accessToken",accessToken,{ ...cookieOptions, maxAge: 15 * 60 * 1000 });
        response.cookie("refeshToken",refreshToken,{ ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return response.status(201).json({
                message:'User Logged in Successfully',
                data:{
                  updateUser,
                  accessToken, 
                  refreshToken,
                },
                error:false,
                success:true
            });
        
    } catch (error) {
        console.log(error.message)
        return response.status(500).json({
            message:'Internal sever error',
            error:true,
            success:false
            
        })
    }
}

//user get data after login
export const getUserData = async (requset, response)=>{
  
    try {
        const userId=requset.userId;
        

        //check user
        if(!userId){
            return response.status(401).json({
            message:"Unauthorized",
            error:true,
            success:false,
        })
        }

        //user from the database
        const user=await UserModel.findById(userId);
        if(!user){
          return response.status(404).json({
            message: "User not found",
            error: true,
            success: false,
          });
        }
        response.status(200).json({ 
          success: true,
          data: user ,
          message:"User data fetched successfully",
        });
    } catch (error) {
        response.status(500).json({ 
          success: false, 
          error:true,
          message: error.message });
    }
}

//verifyEmail adresss
export const verfiyEmail=async(request,response)=>{
    try {
        //get code
        const {code}=request.params;

        //check the code
        if(!code){
            return response.status(401).json({
                message:'verification code is missing',
                error:true,
                success:false,
            })
        }

        //check user from data base
        const user=await UserModel.findById(code);
        if(!user){
             return response.status(401).json({
            message: "Invalid verification link",
            error: true,
            success: false,
        });
        }

        //check the before email verify the
        if (user.verify_email) {
        return response.status(200).json({
            message: "Email already verified",
            error: false,
            success: true,
        });
        }

         user.verify_email = true;
         await user.save();
        
        return response.status(200).json({
            message: "Email verified successfully",
            error: false,
            success: true,
        });
        
    } catch (error) {
        return response.status(500).json({
        message: "Internal server error",
        error: true,
        success: false,
        });
    }
}

//logout
export const logoutUser=async(request,response)=>{
    try {

        const userId=request.userId

        //check user id
        if(!userId){
            return response.status(401).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            path: "/", // Important to actually clear the cookie
        };

        // Clear cookies
        response.clearCookie("accessToken",cookieOptions);
        response.clearCookie("refeshToken",cookieOptions);

        // Remove refresponseh token from database
        await UserModel.findByIdAndUpdate(userId, { refresh_token: null });

        return response.status(200).json({
            message: "User logged out successfully",
            error: false,
            success: true,
        });

        
    } catch (error) {
        console.error("Logout error:", error);
        return response.status(500).json({
        message: "Something went wrong during logout",
        error: true,
        success: false,
        });
    }
}

//delete account
export const deleteUser=async(request,response)=>{
    try {
        const userId=request.userId;

        //check user id
        if(!userId){
            return response.status(401).json({
            message:"Unauthorized",
            error:true,
            success:false,
            });
        }

        //delete account from data base
        const deleteUser=await UserModel.findByIdAndDelete(userId);
        if(!deleteUser){
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        // Clear cookies
        response.clearCookie("accessToken",cookieOptions);
        response.clearCookie("refeshToken",cookieOptions);

        return response.status(200).json({
            message: "User account deleted successfully",
            data:deleteUser, 
            error: false,
            success: true,
        });
        
    } catch (error) {
        console.log(error.message);
        return response.status(500).json({
                message:'Something went wrong during delete acount',
                error:true,
                success:false
            });
        
    }
}

//admin can user status change active or inactive
export const chageUserStatus=async(request,response)=>{
    try {
        
        const {status,userId}=request.body;
        //validate input
        if (!userId || !status) {
            return response.status(400).json({
                message: "User ID and status are required",
                error: true,
                success: false,
            });
        }

        // Allow only specific statuses
        if (!["ACTIVE", "INACTIVE"].includes(status)) {
            return response.status(400).json({
                message: "Invalid status value. Use 'ACTIVE' or 'INACTIVE'.",
                error: true,
                success: false,
            });
        }

        // Update user status
        const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
        );

        //update user data base
        if (!updatedUser) {
        return response.status(404).json({
            message: "User not found",
            error: true,
            success: false,
        });
        }

        return res.status(200).json({
            message: `User status changed to ${status}`,
            data: updatedUser,
            error: false,
            success: true,
        });
        
    } catch (error) {
        console.error("Change user status error:", error.message);
        return response.status(500).json({
            message: "Something went wrong while changing user status",
            error: true,
            success: false,
        });
    }
}
