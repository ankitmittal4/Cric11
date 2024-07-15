import mongoose, { Schema } from "mongoose";

const playerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "Wicket-Keeper", "All-Rounder"],
      required: true,
    },
    credits: {
      type: Number,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
  },
  { timestamps: true }
);

export const Player = mongoose.model("Player", playerSchema);
