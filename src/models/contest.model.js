import mongoose, { Schema } from "mongoose";

const contestSchema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
    },
    entryFee: {
      type: Number,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    totalSpots: {
      type: Number,
      required: true,
    },
<<<<<<< HEAD
    matchRef: {
      type: Schema.Types.ObjectId,
      ref: "Match",
    },
=======
    // status: {
    //   type: String,
    //   enum: ["Open", "Closed", "Completed"],
    //   default: "Open",
    //   required: true,
    // },
>>>>>>> e11e05e3f2f4e6f67dee67708576382dc15eac8d
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
