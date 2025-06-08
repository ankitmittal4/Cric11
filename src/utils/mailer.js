import nodemailer from "nodemailer";
import { getEmailTemplate } from "./templates";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, type, data) => {
    const { subject, html } = getEmailTemplate(type, data);

    const mailOptions = {
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} - ${type}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export { sendEmail };