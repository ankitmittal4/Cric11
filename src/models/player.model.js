import mongoose, { Schema } from "mongoose";

const playerSchema = new Schema(
  {
    matchId: {
      type: String,
    },
    squad: [
      {
        teamName: {
          type: String,
          required: true,
        },
        players: [
          {
            playerId: {
              type: String,
            },
            name: {
              type: String,
            },
            role: {
              type: String,
            },
            country: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Player = mongoose.model("Player", playerSchema);
