import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contest } from "../models/contest.model.js";
import jwt from "jsonwebtoken";

const getAllContests = asyncHandler(async (req, res) => {
  try {
    const contests = await Contest.find();
    console.log("All Contests: ", contests);
    res
      .status(200)
      .json(
        new ApiResponse(200, contests, "All contests fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching contests");
  }
});
const getContestById = asyncHandler(async (req, res) => {
  try {
    // console.log("req.params: ", req.params);
    const { id } = req.body;
    const contest = await Contest.findById(id);
    // console.log("Contest with given id: ", contest);
    if (!contest) {
      throw new ApiError(400, "Contest not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contest,
          "Contest with given id fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching contest with given id");
  }
});

const createContest = asyncHandler(async (req, res) => {
  console.log("------------");
  const {
    matchId,
    entryFee,
    prizePool,
    maxParticipants,
    currentParticipants,
    status,
  } = req.body;
  console.log("++++++++++++");
  if (
    [
      matchId,
      entryFee,
      prizePool,
      maxParticipants,
      currentParticipants,
      status,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const contest = await Contest.create({
    matchId,
    entryFee,
    prizePool,
    maxParticipants,
    currentParticipants,
    status,
  });
  if (!contest) {
    throw new ApiError(500, "Something went wrong while creating a contest");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, contest, "Contest created successfully"));
});

const deleteContest = asyncHandler(async (req, res) => {
  try {
    // console.log("req.params: ", req.params);
    const { id } = req.body;
    // console.log("id: ", id);
    const removedContest = await Contest.findByIdAndDelete(id);
    // console.log("removed contest: ", removedContest);

    if (!removedContest) {
      throw new ApiError(400, "Removed Contest not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Contest with given id deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error while deleting contest with given id");
  }
});

export { getAllContests, getContestById, createContest, deleteContest };
