import express from 'express';
import { sendLoginEmail, sendContestWinEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail, sendPaymentWithdrawSuccessEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.route("/login").post(sendLoginEmail);
router.route("/contest-win").post(sendContestWinEmail);
router.route("/payment-success").post(sendPaymentSuccessEmail);
router.route("/payment-failed").post(sendPaymentFailedEmail);
router.route("/payment-withdraw-success").post(sendPaymentWithdrawSuccessEmail);

export default router;