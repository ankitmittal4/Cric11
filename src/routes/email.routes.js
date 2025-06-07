import express from 'express';
import { sendConfirmationEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.route("/send-confirmation").post(sendConfirmationEmail);

export default router;