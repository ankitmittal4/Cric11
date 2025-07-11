import { Router } from "express";
import { createUserContest } from "../controllers/userContest.controller.js";
import { getAllUserContests } from "../controllers/userContest.controller.js";
import { getUserContestsById } from "../controllers/userContest.controller.js";
import { updateUserContestsById } from "../controllers/userContest.controller.js";
import { updateTeam } from "../controllers/userContest.controller.js";
import { deleteUserContestsById } from "../controllers/userContest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createUserContest);
router.route("/all").get(verifyJWT, getAllUserContests);
router.route("/get").post(verifyJWT, getUserContestsById);
router.route("/update").post(verifyJWT, updateUserContestsById);
router.route("/update-team").post(verifyJWT, updateTeam);
router.route("/delete").post(verifyJWT, deleteUserContestsById);

export default router;
