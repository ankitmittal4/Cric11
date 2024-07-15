import { Router } from "express";
import {} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post();

export default router;
