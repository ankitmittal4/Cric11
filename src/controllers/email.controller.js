import { sendEmail } from "../utils/mailer.js";
import { User } from "../models/user.model.js";

const sendLoginEmail = async (req, res) => {
    const { email, name, time } = req.body;

    try {
        await sendEmail(email, "login", { name, time });
        res.status(200).json({ message: "Login email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send login email" });
    }
};

const sendContestWinEmail = async (req, res) => {
    const { email, name, contestName, winnings } = req.body;

    try {
        await sendEmail(email, "contest-win", { name, contestName, winnings });
        res.status(200).json({ message: "Contest win email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send contest win email" });
    }
};

const sendPaymentSuccessEmail = async (req, res) => {
    const { email, name, amount, transactionId } = req.body;

    try {
        await sendEmail(email, "payment-success", { name, amount, transactionId });
        res.status(200).json({ message: "Payment success email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send payment success email" });
    }
};

const sendPaymentFailedEmail = async (req, res) => {
    const { email, name, amount, transactionId } = req.body;

    try {
        await sendEmail(email, "payment-failed", { name, amount, transactionId });
        res.status(200).json({ message: "Payment failed email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send payment failed email" });
    }
};

const sendPaymentWithdrawSuccessEmail = async (req, res) => {
    const { email, name, amount, transactionId, upiId } = req.body;

    try {
        await sendEmail(email, "payment-withdraw-success", { name, amount, transactionId, upiId });
        res.status(200).json({ message: "Payment success email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send payment success email" });
    }
}

const sendContactUsSuccessEmail = async (req, res) => {
    const { email, name, message } = req.body;
    const adminMail = process.env.ADMIN_EMAIL;

    try {
        await sendEmail(adminMail, "contact-us", { email, name, message });
        res.status(200).json({ message: "Contact Us email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to send conatct us email" });
    }
}

export { sendLoginEmail, sendContestWinEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail, sendPaymentWithdrawSuccessEmail, sendContactUsSuccessEmail };







