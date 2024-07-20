import { Router } from "express";
import {
  getAllContests,
  getContestById,
  createContest,
  deleteContest,
  updateContest,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(getAllContests);
router.route("/get").post(getContestById);
router.route("/create").post(createContest);
router.route("/delete").delete(deleteContest);
router.route("/update").patch(updateContest);

export default router;
