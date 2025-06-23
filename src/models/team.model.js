import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    teamName: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export const Team = mongoose.model("Team", teamSchema);
