import { Router } from "express";
import {
  deleteTeam,
  updateTeam,
  createTeam,
  getAllTeams,
  getTeamById,
} from "../controllers/team.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(getAllTeams);
router.route("/get").post(getTeamById);
router.route("/create").post(createTeam);
router.route("/update").post(updateTeam);
router.route("/delete").delete(deleteTeam);

export default router;
