import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt'
import generatedAccesToken from "../utill/generatedAccesToken.js";
import generatedRefreshToken from "../utill/generatedRefreshToken.js";
import axios from "axios";
import generatedOtp from "../utill/genarateOtp.js";
import { sendOtpMail, sendWelcomeOffer } from "../services/email/mailtemplate/sendMail.js";
import Coupon from "../models/coupon.model.js";

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
        await sendWelcomeMail(newUser,verifyurl);
        const coupon = await Coupon.findOne({ code: "WELCOME20" });
    
        if (!coupon) return;

        await sendWelcomeOffer(newUser , coupon);

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
        const {code}=request.params.code;

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
        const userId=request.params.id;
        

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
export const changeUserStatus = async (request, response) => {
  try {
    const userId = request.params.id;
    //console.log("User ID:", userId);

    // Validate input
    if (!userId) {
      return response.status(400).json({
        message: "User ID is required",
        error: true,
        success: false,
      });
    }

    // ✅ MUST use await
    const user = await UserModel.findById(userId);
    //console.log("User:", user);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Toggle role
    user.role = user.role === "ADMIN" ? "USER" : "ADMIN";

    // ✅ Works because user is a Mongoose document
    await user.save();

    return response.status(200).json({
      message: `User role changed to ${user.role}`,
      data: user,
      error: false,
      success: true,
    });

  } catch (error) {
    console.error("Change user status error:", error);
    return response.status(500).json({
      message: "Something went wrong while changing user status",
      error: true,
      success: false,
    });
  }
};


//google login
export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        message: "Access token missing",
        success: false
      });
    }

    
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );
    console.log(googleResponse.data);

    const { email, name, picture } = googleResponse.data;

    if (!email) {
      return res.status(400).json({
        message: "Google user info missing email",
        success: false
      });
    }

    // 2️⃣ Check if user exists
    let user = await UserModel.findOne({ email });

    // 3️⃣ If not, create new user
    if (!user) {
      user = await UserModel.create({
        name: name || "Google User",
        email,
        avatar: picture,
        password: "GoogleOAuth", 
        provider: "google",
        last_lagin_date:Date.now()
      });
      const coupon = await Coupon.findOne({ code: "WELCOME20" });
    
        if (!coupon) return;

        await sendWelcomeOffer(user , coupon);
    }

    // 4️⃣ Generate tokens
    const accessToken = generatedAccesToken(user);
    const refreshToken = generatedRefreshToken(user._id);
    console.log("Generated Tokens:", { accessToken });

    // 5️⃣ Store refresh token in cookie
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Google Login Successful",
      success: true,
      data: {
        updateUser: user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.log("Google Login Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

//send otp for password reset
export const forgotPassword = async (requset, response) => {
  try {
    const email =requset.params.email;
   
    // Find user
    const user = await UserModel.findOne({ email });

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Create OTP
    const otp = generatedOtp();
    //console.log("Generated OTP:", otp);
    

    // OTP valid for 5 minutes
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    

    // Update user
    const updateUser = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(otpExpiry).toISOString(),
    });

    // Send OTP if update successful
    if (updateUser) {
        await sendOtpMail(user,otp);
      //await sendOtp(user, otp); // Make sure to await
      console.log("✅ OTP email sent successfully!"+updateUser.email);
    }

    return response.status(200).json({
      message: "Password responseet OTP sent to your email",
      error: false,
      success: true,
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return response.status(500).json({
      message: "Something went wrong during forgot password process",
      error: true,
      success: false,
    });
  }
};

//otp verfiy
export const verifyForgotPasswordOtp= async (requset,response)=>{
  try {
     
    //get user and password
    const {email,otp}=requset.body;

      //check otp and email exist
    if(!email||!otp){
      return response.status(400).json({
        message:'Provide email and otp',
        error:true,
        success:false,
      })
  }
    //check user
    const user=await UserModel.findOne({email})

    if(!user){
      return response.status(400).json({
        message:'Not found User',
        error:true,
        success:false,
      })
    }

    
    //console.log(otp);
    //console.log(user.forgot_password_otp)

    //check otp expire
    const currentTime=new Date();
    if(user.forgot_password_expiry<currentTime){
      return response.status(400).json({
        message:'Otp expaired',
        error:true,
        success:false,
      })
    }

    //check otp
    if(otp!==user.forgot_password_otp){
      return response.status(400).json({
        message:'Otp invalid',
        error:true,
        success:false,
      })
    }

    //update database
    await UserModel.findByIdAndUpdate(user._id,{
      forgot_password_expiry:null,
      forgot_password_otp:null
    })

    return response.status(200).json({
      message: "Verify Otp sussesfully ",
      error: false,
      success: true,
    });

    
  } 
  catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }

}

//reseet password
export const resetPassword = async (requset, response) => {
  try {
    const { email, password } = requset.body;

    // Validate input
    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 16);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return response.status(200).json({
      message: "Password responseet successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

//update user profile
export const updateUsers = async (requset, response) => {
  try {
    const userId = requset.userId;
    const { name, mobile,avatar} = requset.body;
    
     
    //check user id
    if (!userId) {
      return response.status(401).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    //check user in data base
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return response.status(404).json({
        message: "User not found ",
        error: true,
        success: false,
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;

    if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password -refresponseh_token");

    return response.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return response.status(500).json({
      message: "Something went wrong during update",
      error: true,
      success: false,
    });
  }
};

//get all user
export const getAllUsers = async(request,response)=>{
  try {
    const user =await UserModel.find()

    return response.status(200).json({
      data:user,
      error:false,
      success:true,
      message:'Fetch all Users'
    })
    
  } catch (error) {
    console.error("Update user error:", error);
    return response.status(500).json({
      message: "Something went wrong during update",
      error: true,
      success: false,
    });
  }
}