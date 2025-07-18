import express from 'express';
import { sendLoginEmail, sendContestWinEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail, sendPaymentWithdrawSuccessEmail, sendContactUsSuccessEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.route("/login").post(sendLoginEmail);
router.route("/contest-win").post(sendContestWinEmail);
router.route("/payment-success").post(sendPaymentSuccessEmail);
router.route("/payment-failed").post(sendPaymentFailedEmail);
router.route("/payment-withdraw-success").post(sendPaymentWithdrawSuccessEmail);
router.route("/contact-us").post(sendContactUsSuccessEmail);


export default router;