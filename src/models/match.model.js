import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    teamA: {
      type: String,
      required: true,
    },
    teamB: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed"],
      default: "Scheduled",
    },
    venue: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Match = mongoose.model("Match", matchSchema);
