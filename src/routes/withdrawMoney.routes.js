import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { withdraw } from '../controllers/withdrawMoney.controller.js';
const router = express.Router();

router.route("/withdraw-money").post(verifyJWT, withdraw);

export default router;
