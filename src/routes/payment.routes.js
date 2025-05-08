import express from 'express';
import payment from '../controllers/payment.controller.js';

const router = express.Router();

router.route("/create-order").post(payment);

export default router;
