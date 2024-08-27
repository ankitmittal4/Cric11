import { Router } from "express";
import { createUserContest } from "../controllers/userContest.controller.js";
import { getAllUserContests } from "../controllers/userContest.controller.js";
import { getUserContestsById } from "../controllers/userContest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/create").post(createUserContest);
// router.route("/all").get(getAllUserContests);
// router.route("/get").post(getUserContestsById);

router.route("/create").post(verifyJWT, createUserContest);
router.route("/all").get(verifyJWT, getAllUserContests);
router.route("/get").post(verifyJWT, getUserContestsById);

export default router;
