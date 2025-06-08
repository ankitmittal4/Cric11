
const getEmailTemplate = (type, data) => {
    switch (type) {
        case "login":
            return {
                subject: "Login Alert",
                html: `<h2>Hello ${data.name},</h2>
                 <p>You have successfully logged in at ${data.time}.</p>`,
            };

        case "payment-success":
            return {
                subject: "Payment Successful",
                html: `<h2>Hello ${data.name},</h2>
                 <p>Thank you for your payment of ₹${data.amount}.</p>
                 <p>Your transaction ID: ${data.transactionId}</p>`,
            };

        case "payment-failed":
            return {
                subject: "Payment Failed",
                html: `<h2>Hello ${data.name},</h2>
                 <p>Your payment of ₹${data.amount} failed.</p>
                 <p>Reason: ${data.reason}</p>`,
            };

        case "contest-win":
            return {
                subject: "🎉 Congratulations! You Won a Contest",
                html: `<h2>Hi ${data.name},</h2>
                 <p>You have won ₹${data.winnings} in the contest <strong>${data.contestName}</strong>.</p>
                 <p>Keep playing and winning!</p>`,
            };

        default:
            return {
                subject: "Notification",
                html: `<p>Hello ${data.name}, this is a default message.</p>`,
            };
    }
};

export { getEmailTemplate };