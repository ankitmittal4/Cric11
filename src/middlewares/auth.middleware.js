import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(400, "Unauthorized User");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(400, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(400, "Access token not present");
  }
});
const verifyJWTAdmin = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(400, "Unauthorized Admin");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!admin) {
      throw new ApiError(400, "Invalid access token");
    }
    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(400, "Access token not present for admin");
  }
});

export { verifyJWT, verifyJWTAdmin };
