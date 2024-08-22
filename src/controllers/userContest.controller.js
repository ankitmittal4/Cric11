import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model.js";
import { Contest } from "../models/contest.model.js";
const createUserContest = async (req, res) => {
  const { _id } = req.user;
  const contest = await Contest.findById(req.body.contestId);
  const { contestId, players, captain, viceCaptain } = req.body;

  const userContest = new UserContest({
    userId: _id,
    matchId: contest.matchRef,
    contestId,
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
const getAllUserContests = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const userContests = await UserContest.find({ userId })
      .populate("contestId", "name entryFee")
      .populate("matchId", "teamA teamB startTime")
      .populate("players", "name role")
      .populate("captain", "name role")
      .populate("viceCaptain", "name role");

    console.log("userContests: ", userContests);
    // console.log(">>>>>>>>>>>>>>>>>>>>");
    if (!userContests || userContests.length === 0) {
      return res
        .status(404)
        .json({ message: "No contests found for this user." });
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userContests,
          "All user contests fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching user contests");
  }
});
export { createUserContest, getAllUserContests };
