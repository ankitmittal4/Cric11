import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
        // console.log(options);
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

        const transactionId = razorpay_payment_id;
        const orderId = razorpay_order_id;
        const transaction = await Transaction.create({
            userId: _id,
            transactionId: transactionId,
            orderId: orderId,
            amount: Number(amount),
            transactionType: "credit",
            transactionStatus: "success",
            message: "Added Money",
        });
        // console.log(transaction);
        // res.status(200).json({ success: true, message: "Payment verified and wallet updated" });
        res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    transaction,
                    "Payment verified and wallet updated"
                )
            );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Payment verification failed");
        // res.status(500).json({ success: false, message: "Payment verification failed" });
    }
});

const failedPayment = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        const { code, source, description, reason, order_id, payment_id, amount, razorpay_order_id } = req.body;

        const user = await User.findById(_id);

        const transactionId = payment_id;
        const orderId = razorpay_order_id;
        const transaction = await Transaction.create({
            userId: _id,
            transactionId: transactionId,
            orderId: orderId,
            amount: Number(amount),
            transactionType: "nothing",
            transactionStatus: "failed",
            message: "Added Money",
        });
        res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    transaction,
                    "Payment failed successfully"
                )
            );
        // res.status(200).json({ success: true, message: "Payment failed successfully" });
    } catch (error) {
        console.error("Payment failed error: ", error);
        // res.status(500).json({ success: false, message: "Payment failed unsuccessfully" });
        throw new ApiError(500, "Payment failed");
    }
});

export { payment, verifyPayment, failedPayment };