import { Router } from "express";
import {
  getAllContestsOfGivenMatch,
  getContestById,
  createContest,
  deleteContest,
  updateContest,
  getAllContests,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all-contests").get(getAllContests);
router.route("/all").post(getAllContestsOfGivenMatch);
router.route("/get").post(getContestById);
router.route("/create").post(createContest);
router.route("/delete").delete(deleteContest);
router.route("/update").patch(updateContest);

export default router;
