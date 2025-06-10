import express from 'express';
import { sendLoginEmail, sendContestWinEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.route("/login").post(sendLoginEmail);
router.route("/contest-win").post(sendContestWinEmail);
router.route("/payment-success").post(sendPaymentSuccessEmail);
router.route("/payment-failed").post(sendPaymentFailedEmail);

export default router;