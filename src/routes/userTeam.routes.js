import { Router } from "express";
import {
  createUserTeam,
  deleteUserTeam,
  getAllUserTeams,
  getUserTeamById,
  updateUserTeam,
} from "../controllers/userTeam.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(createUserTeam);
router.route("/all").get(getAllUserTeams);
router.route("/get").post(getUserTeamById);
router.route("/update").patch(updateUserTeam);
router.route("/delete").delete(deleteUserTeam);

export default router;
