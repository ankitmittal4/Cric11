import express from 'express';
import { payment, verifyPayment, failedPayment } from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/create-order").post(verifyJWT, payment);
router.route("/verify").post(verifyJWT, verifyPayment);
router.route("/failed").post(verifyJWT, failedPayment);

export default router;
