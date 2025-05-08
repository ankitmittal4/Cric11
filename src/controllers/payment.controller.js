import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const payment = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    try {
        const options = {
            amount: amount * 100,
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Order creation failed' });
    }
});

export default payment;