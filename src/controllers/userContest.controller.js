import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model.js";

const createUserContest = async (req, res) => {
  // console.log("req.user: ", req.user);
  const { _id } = req.user;
  const { contestId, matchId, players, captain, viceCaptain } = req.body;
  const userContest = new UserContest({
    userId: _id,
    contestId,
    matchId,
    players,
    captain,
    viceCaptain,
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
  } catch (error) {
    console.log("Error while creating user Contest: ", error);
    throw new ApiError(400, "Error while creating user Contests");
  }
};

export { createUserContest };
