import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const generateRefreshToken = async (user) => {
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: "7d",
  });

  // Save refresh token in DB
  await UserModel.updateOne(
    { _id: user._id },
    { refresh_token: token }
  );

  return token;
};

export default generateRefreshToken;
