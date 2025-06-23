import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import mongoose, { Mongoose } from "mongoose";

const getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
    ]);
    const user = await User.findById(userId);
    const { walletBalance } = user;
    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this userId" });
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { transactions, walletBalance },
          "All Transaction fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error in get all Transactions");
    throw new ApiError(500, "Error while fetching transactions");
  }
});

export { getAllTransactions };
