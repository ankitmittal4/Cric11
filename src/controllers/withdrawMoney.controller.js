import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";

const withdraw = asyncHandler(async (req, res) => {
    const { amount } = req.body;
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

    user.walletBalance -= amount;
    await user.save();

    const withdrawRequest = await Transaction.create({
        userId: user._id,
        transactionId: null,
        orderId: null,
        amount: Number(amount),
        transactionType: "debit",
        transactionStatus: "success",
        message: "Withdraw Money",
    });

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { withdrawRequest, walletBalance: user.wallet },
                "Withdrawal simulated successfully in test mode"
            )
        );
});

export { withdraw }