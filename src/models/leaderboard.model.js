import mongoose, { Schema } from "mongoose";

const leaderboardSchema = new Schema(
  {
    contestId: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Leaderboard = mongoose.model(
  "Leaderboard",
  leaderboardSchemachema
);
