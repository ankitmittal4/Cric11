import mongoose, { Schema } from "mongoose";

const userContestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
    },
    playedDate: {
      type: Date,
    },
    score: {
      type: Number,
    },
    // rank: {
    //   type: Number,
    // },
  },
  { timestamps: true }
);

export const UserContest = mongoose.model("UserContest", userContestSchema);
