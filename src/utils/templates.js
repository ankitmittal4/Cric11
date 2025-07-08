
const getEmailTemplate = (type, data) => {
    switch (type) {
        case "login":
            return {
                subject: "Login Alert",
                html: `<h2>Hello ${data.name},</h2>
                 <p>You have successfully logged in at ${data.time}.</p>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`,

            };
        case "login-otp":
            return {
                subject: "Your OTP for Login - Cric11",
                html: `<h2>Your OTP is <b>${data.otp}</b> <br/><br/>It expires in 2 minutes.</h2>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`,
            };
        case "payment-success":
            return {
                subject: "Payment Successful",
                html: `<h2>Hello ${data.name},</h2>
                 <p>Thank you for your payment.</p>
                 <p><strong>Amount:</strong> ₹${data.amount}</p>
                 <p>Transaction ID: ${data.transactionId}</p>
                 <p>Your transaction was successful. If you have any questions, feel free to contact our support team.</p>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`
            };

        case "payment-failed":
            return {
                subject: "Payment Failed",
                html: `<h2>Hello ${data.name},</h2>
                 <p>Your payment of ₹${data.amount} failed.</p>
                 <p>Transaction ID: ${data.transactionId}</p>
                 <p>If you have any questions, feel free to contact our support team.</p>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`,
            };

        case "contest-win":
            return {
                subject: "🎉 Congratulations! You Won a Contest",
                html: `<h2>Hi ${data.name},</h2>
                 <p>You have won ₹${data.winnings} in the contest <strong>${data.contestName}</strong>.</p>
                 <p>Keep playing and winning!</p>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`,
            };
        case "payment-withdraw-success":
            return {
                subject: "Payment Withdrawl Successful",
                html: `<h2>Hello ${data.name},</h2>
                    <p>Your withdrawl is successfull.</p>
                    <p>Thank you for your payment.</p>
                    <p><strong>Amount:</strong> ₹${data.amount}</p>
                    <p>Transaction ID: ${data.transactionId}</p>
                    <p>UPI ID: ${data.upiId}</p>
                    <p>Your transaction was successful. If you have any questions, feel free to contact our support team.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p><strong>Cric11 Team</strong></p>`
            };
        case "contact-us":
            return {
                subject: "Contact Us Message Received",
                html: `<h2>Hello Cric11 Admin,</h2>
                  <p>You have received a new message from the <strong>Contact Us</strong> form.</p>
              
                  <p><strong>Name:</strong> ${data.name}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Message:</strong><br/>${data.message}</p>
              
                  <br/>
                  <p>Please respond to this message as soon as possible.</p>
                  <br/>
                  <p>Best regards,</p>
                  <p><strong>Cric11 Web Application</strong></p>`
            };

        default:
            return {
                subject: "Notification",
                html: `<p>Hello ${data.name}, this is a default message.</p>
                 <br/>
                 <p>Best regards,</p>
                 <p><strong>Cric11 Team</strong></p>`,
            };
    }
};

export { getEmailTemplate };