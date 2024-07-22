import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    teamName: {
      type: String,
      required: true,
    },
    players: [
      {
        type: String,
        // type: Schema.Types.ObjectId,
        // ref: "Player",
      },
    ],
  },
  { timestamps: true }
);

export const Team = mongoose.model("Team", teamSchema);
