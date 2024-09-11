import { Router } from "express";
import {
  createOpponent,
  getOpponent,
} from "../controllers/opponent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.route("/create").post(createUserContest);
// router.route("/all").get(getAllUserContests);
// router.route("/get").post(getUserContestsById);

router.route("/create").post(createOpponent);
router.route("/get").post(getOpponent);
// router.route("/all").get(verifyJWT, getAllUserContests);
// router.route("/get").post(verifyJWT, getUserContestsById);

export default router;
