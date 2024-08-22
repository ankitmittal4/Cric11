import { Router } from "express";
import { createUserContest } from "../controllers/userContest.controller.js";
import { getAllUserContests } from "../controllers/userContest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createUserContest);
router.route("/all").get(verifyJWT, getAllUserContests);

export default router;
