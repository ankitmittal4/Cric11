import mongoose, { Schema } from "mongoose";

const opponentSchema = new Schema(
  {
    contestId: {
      type: Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    opponents: [
      [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    ],
  },
  { timestamps: true }
);

export const Opponent = mongoose.model("Opponent", opponentSchema);
