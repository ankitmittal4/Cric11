import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model.js";
import { Contest } from "../models/contest.model.js";
import mongoose from "mongoose";
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
    // const userContests = await UserContest.find({ userId })
    //   .populate("contestId", "entryFee prizePool maxParticipants squadRef")
    //   .populate("matchId", "name teamA teamB date venue startTime matchType")
    //   .populate("captain", "name role")
    //   .populate("viceCaptain", "name role");

    // .populate("players", "name role")

    // console.log(new mongoose.O)
    const userContests = await UserContest.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "contests",
          localField: "contestId",
          foreignField: "_id",
          as: "userContestData",
        },
      },
      {
        $unwind: "$userContestData",
      },
      {
        $lookup: {
          from: "players",
          localField: "userContestData.squadRef",
          foreignField: "_id",
          as: "squad",
        },
      },
    ]);

    console.log(userContests);
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
    console.log("error: ", error);
    throw new ApiError(500, "Error while fetching user contests");
  }
});
export { createUserContest, getAllUserContests };
