import { Router } from "express";
import {
  deletePlayer,
  updatePlayer,
  createPlayer,
  getAllPlayers,
  getPlayerById,
} from "../controllers/player.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").get(getAllPlayers);
router.route("/get").post(getPlayerById);
router.route("/create").post(createPlayer);
router.route("/update").patch(updatePlayer);
router.route("/delete").delete(deletePlayer);

export default router;
