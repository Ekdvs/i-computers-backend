import jwt from "jsonwebtoken"; 
import UserModel from "../models/user.model.js";
const auth=async(request,response,next)=>{
    try {
        // Get token from cookies or Authorization header
    const token = request.cookies?.accessToken ||
                  (request.headers.authorization && request.headers.authorization.split(" ")[1]);
    
    //check the token
    if(!token){
       return response.status(401).json({
        message: "No token provided. Unauthorized",
        error: true,
        success: false,
      }); 
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decoded) {
      return response.status(401).json({
        message: "Invalid token. Unauthorized",
        error: true,
        success: false,
      });
    }

    // Find user in DB
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    request.userId = decoded.id;
    next();

        
    } catch (error) {
    console.error("Auth middleware error:", error);
    return response.status(401).json({
      message: "Invalid or expired token",
      error: true,
      success: false,
    });
    }
}

export default auth;