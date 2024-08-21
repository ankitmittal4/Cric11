import { Router } from "express";
import { createUserContest } from "../controllers/userContest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(createUserContest);

export default router;
