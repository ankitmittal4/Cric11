import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Opponent } from "../models/opponent.model.js";
import mongoose from "mongoose";

const createOpponent = asyncHandler(async (req, res) => {
  const { contestId, user_id } = req.body;
  // console.log("user_id: ", user_id);

  try {
    let opponent = await Opponent.findOne({ contestId });

    if (opponent) {
      let added = false;

      for (let pair of opponent.opponents) {
        if (pair.length < 2) {
          pair.push(user_id);
          added = true;
          break;
        }
      }

      if (!added) {
        opponent.opponents.push([user_id]);
      }

      const updatedOpponent = await opponent.save();
      res
        .status(200)
        .json(
          new ApiResponse(200, updatedOpponent, "Opponent updated successfully")
        );
    } else {
      opponent = new Opponent({
        contestId,
        opponents: [[user_id]],
      });

      const savedOpponent = await opponent.save();
      res
        .status(201)
        .json(
          new ApiResponse(201, savedOpponent, "Opponent created successfully")
        );
    }
  } catch (error) {
    console.log("Error while creating/updating Opponent: ", error);
    throw new ApiError(400, "Error while creating/updating Opponent");
  }
});
const getOpponent = asyncHandler(async (req, res) => {
  const { contestId, user_id } = req.body;
  console.log("user_id: ", user_id);
});

export { createOpponent };
