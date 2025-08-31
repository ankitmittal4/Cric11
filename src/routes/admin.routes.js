import { Router } from "express";
import { loginAdmin, registerAdmin, logoutAdmin, getAllUsers } from "../controllers/admin.controller.js";
import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/logout").post(verifyJWTAdmin, logoutAdmin);
router.route("/all-users").post(verifyJWTAdmin, getAllUsers);

export default router;
