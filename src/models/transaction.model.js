import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    transactionId: {
      type: String,
      // required: true,
    },
    orderId: {
      type: String,
      // required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["debit", "credit", "nothing", "refund"],
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
