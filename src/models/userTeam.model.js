import mongoose, { Schema } from "mongoose";

const userTeamSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    contestId: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
    ],
    captain: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    viceCaptain: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
  },
  { timestamps: true }
);

export const UserTeam = mongoose.model("UserTeam", userTeamSchema);
