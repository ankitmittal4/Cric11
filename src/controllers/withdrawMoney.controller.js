import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";
import axios from 'axios';

const base64 = Buffer.from(`${process.env.RAZORPAYX_KEY_ID}:${process.env.RAZORPAYX_KEY_SECRET}`).toString('base64');

const headers = {
    Authorization: `Basic ${base64}`,
    'Content-Type': 'application/json'
};
async function createContact(name, email, phone) {
    const res = await axios.post('https://api.razorpay.com/v1/contacts', {
        name,
        email,
        contact: phone,
        type: 'customer'
    }, { headers });

    return res.data.id;
}
async function createFundAccount(contactId, upiAddress) {
    const res = await axios.post('https://api.razorpay.com/v1/fund_accounts', {
        contact_id: contactId,
        account_type: 'vpa',
        vpa: {
            address: upiAddress
        }
    }, { headers });

    return res.data.id;
}
async function initiatePayout(fundAccountId, amountInRupees) {
    const res = await axios.post('https://api.razorpay.com/v1/payouts', {
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
        fund_account_id: fundAccountId,
        amount: amountInRupees * 100, // convert to paise
        currency: 'INR',
        mode: 'UPI',
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: 'txn_' + Date.now(),
        narration: 'UPI Transfer'
    }, { headers });

    return res.data;
}

const withdraw = asyncHandler(async (req, res) => {
    const { name, email, phone, upi, amount } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found");
        return
    }

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Invalid withdrawal amount");
        return
    }
    if (amount > user?.walletBalance) {
        throw new ApiError(400, "Withdrawal amount is greater than wallet balance");
        return
    }


    if (user.walletBalance < amount) {
        throw new ApiError(400, "Insufficient wallet balance");
        return;
    }

    try {
        const contactId = await createContact(name, email, phone);
        const fundAccountId = await createFundAccount(contactId, upi);
        const payout = await initiatePayout(fundAccountId, amount);
        user.walletBalance -= amount;
        await user.save();

        const withdrawRequest = await Transaction.create({
            userId: user._id,
            transactionId: payout.id,
            orderId: payout.fund_account_id,
            amount: Number(amount),
            transactionType: "debit",
            transactionStatus: "success",
            message: "Withdraw Money",
        });
        // console.log(withdrawRequest);
        res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { payout, walletBalance: user.walletBalance, transactionId: withdrawRequest._id },
                    "Withdrawal successfully in test mode"
                )
            );
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }

});

export { withdraw }