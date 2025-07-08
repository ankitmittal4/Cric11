import { Router } from "express";
import {
  logoutUser,
  registerUser,
  refreshAccessToken,
  getUserWalletBalance,
  sendLoginOtp,
  verifyOtpAndLoginUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login-otp").post(sendLoginOtp);
router.route("/verify-otp").post(verifyOtpAndLoginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-balance").get(verifyJWT, getUserWalletBalance);

export default router;
