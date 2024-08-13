import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
    },

    matchType: {
      type: String,
    },
    name: {
      type: String,
    },
    teamA: {
      type: String,
      required: true,
    },
    teamB: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
    startTime: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Match = mongoose.model("Match", matchSchema);
