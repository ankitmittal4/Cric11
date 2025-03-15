import { Router } from "express";
import { getAllTransactions } from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/all").post(verifyJWT, getAllTransactions);

export default router;
