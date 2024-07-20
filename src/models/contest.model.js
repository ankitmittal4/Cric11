import mongoose, { Schema } from "mongoose";

const contestSchema = new Schema(
  {
    matchId: {
      // type: Schema.Types.ObjectId,
      // ref: "Match",
      type: String,
    },
    entryFee: {
      type: Number,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    currentParticipants: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Completed"],
      default: "Open",
      required: true,
    },
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
