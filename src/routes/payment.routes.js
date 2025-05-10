import express from 'express';
import { payment, verifyPayment } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/create-order").post(verifyJWT, payment);
router.route("/verify").post(verifyJWT, verifyPayment);

export default router;
