import mongoose, { Schema } from "mongoose";

const contestSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
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
    matchRef: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
