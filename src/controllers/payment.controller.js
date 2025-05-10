import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const payment = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    try {
        const options = {
            amount: amount * 100,
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        if (!order) {
            return res.status(500).json({ success: false, message: 'Order creation failed' });
        }
        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Order creation failed' });
    }
});

const verifyPayment = asyncHandler(async (req, res) => {
    try {

        const { _id } = req.user;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }
        const user = await User.findById(_id);
        const { walletBalance } = user;

        const newBalance = walletBalance + Number(amount);

        await User.findByIdAndUpdate(
            _id,
            { walletBalance: newBalance },
            { new: true }
        );

        const transaction = await Transaction.create({
            userId: _id,
            amount: Number(amount),
            transactionType: "credit",
            transactionStatus: "success",
        });
        res.status(200).json({ success: true, message: "Payment verified and wallet updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Payment verification failed" });
    }
});
export { payment, verifyPayment };