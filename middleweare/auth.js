import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (request, response, next) => {
  try {
    // Extract token
    let token =
      request.cookies?.accessToken ||
      (request.headers.authorization?.startsWith("Bearer ")
        ? request.headers.authorization.split(" ")[1]
        : null);

    //console.log("🔍 Received Token:", token);

    if (!token) {
      return response.status(401).json({
        message: "No token provided",
        error: true,
        success: false,
      });
    }

    // Verify
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    // Find user
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    request.userId = user._id;
    request.user = user;
    next();

  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    return response.status(401).json({
      message: "Invalid or expired token",
      error: true,
      success: false,
    });
  }
};

export default auth;
