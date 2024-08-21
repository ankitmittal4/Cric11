import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model";

const createUserContest = async (req, res) => {
  const userContest = new UserContest({
    userId: req.user.id,
    contestId: req.body.contestId,
    matchId: req.body.matchId,
    players: req.body.players,
    captain: req.body.captain,
    viceCaptain: req.body.viceCaptain,
  });

  try {
    const savedUserContest = await userContest.save();
    res
      .status(201)
      .json(
        new ApiResponse(
          200,
          savedUserContest,
          "User contest created successfully"
        )
      );
  } catch (err) {
    console.log("Error while creating user Contest: ", error);
    throw new ApiError(400, "Error while creating user Contests");
  }
};

export { createUserContest };
