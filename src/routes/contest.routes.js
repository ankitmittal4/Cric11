import { Router } from "express";
import {
  getAllContests,
  getContestById,
  createContest,
  deleteContest,
} from "../controllers/contest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(getAllContests);
router.route("/get").post(getContestById);
router.route("/create").post(createContest);
router.route("/delete").delete(deleteContest);

export default router;
