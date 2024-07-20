import { Router } from "express";
import {
  getAllMatches,
  getMatchById,
  createMatch,
  deleteMatch,
} from "../controllers/match.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(getAllMatches);
router.route("/get").post(getMatchById);
router.route("/create").post(createMatch);
router.route("/delete").delete(deleteMatch);

export default router;
