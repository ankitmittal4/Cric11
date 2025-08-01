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
            id: {
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
            playerImg: {
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
