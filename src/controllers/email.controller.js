import nodemailer from 'nodemailer';

// const nodemailer = require("nodemailer");

const sendConfirmationEmail = async (req, res) => {
    const { email, name } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // or use host, port for other services
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: '"Cric11" <cric11fantasyapp@email.com>',
            to: email,
            subject: "Payment Confirmation",
            html: `<h2>Hello ${name},</h2>
             <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
             <a href="http://localhost:3000/confirm?email=${email}">Confirm Email</a>`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Confirmation email sent" });
    } catch (err) {
        console.error("Email send error:", err);
        res.status(500).json({ message: "Failed to send email" });
    }
};

export { sendConfirmationEmail }






