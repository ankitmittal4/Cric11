import { Router } from "express";
import {
  getAllContests,
  getContestById,
  createContest,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all-contests").get(getAllContests);
router.route("/c/:id").post(getContestById);
router.route("/create-contest").post(createContest);

export default router;
