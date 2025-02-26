import mongoose, { Schema } from "mongoose";

const userContestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      // type: String,
      required: true,
    },
    players: [
      {
        type: String,
        ref: "Player",
        required: true,
      },
    ],
    captain: {
      type: String,
      ref: "Player",
      required: true,
    },
    viceCaptain: {
      type: String,
      ref: "Player",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    result: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const UserContest = mongoose.model("UserContest", userContestSchema);
