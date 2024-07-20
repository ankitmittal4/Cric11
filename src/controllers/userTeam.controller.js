import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contest } from "../models/contest.model.js";
import { UserTeam } from "../models/userTeam.model.js";

const getAllUserTeams = asyncHandler(async (req, res) => {
  try {
    const userTeams = await UserTeam.find()
      .populate("userId", "username email")
      .populate("contestId", "entryFee prizePool status")
      .populate("matchId", "teamA teamB startTime")
      .populate("players", "name team role")
      .populate("captain", "name team role")
      .populate("viceCaptain", "name team role");
    if (!userTeams) {
      throw new ApiError(402, "User Teams not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, userTeams, "User teams fetched successfully"));
  } catch (error) {
    console.log("Error while fetching user teams: ", error);
    throw new ApiError(400, "Error while fetching User teams");
  }
});

const getUserTeamById = asyncHandler(async (req, res) => {
  try {
    const userTeam = await UserTeam.findById(req.body.id)
      .populate("userId", "username email")
      .populate("contestId", "entryFee prizePool status")
      .populate("matchId", "teamA teamB startTime")
      .populate("players", "name team role")
      .populate("captain", "name team role")
      .populate("viceCaptain", "name team role");
    if (!userTeam) {
      throw new ApiError(402, "User Team with given id not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userTeam,
          "User team with given id fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error while fetching user team with given id: ", error);
    throw new ApiError(400, "Error while fetching User team with given id");
  }
});
const createUserTeam = asyncHandler(async (req, res) => {
  try {
    const { userID, contestId, matchId, players, captain, viceCaptain } =
      req.body;
    if (
      [userID, contestId, matchId, players, captain, viceCaptain].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const userTeam = await userTeam.create({
      userID,
      contestId,
      matchId,
      players,
      captain,
      viceCaptain,
    });
    if (!userTeam) {
      throw new ApiError(500, "Error in creating user team");
    }
    const savedUserTeam = await userTeam.save();
    res
      .status(200)
      .json(
        new ApiResponse(200, savedUserTeam, "User team created successfully")
      );
  } catch (error) {
    console.log("Error while creating user team: ", error);
    throw new ApiError(400, "Error while creating User team");
  }
});
const updateUserTeam = asyncHandler(async (req, res) => {
  try {
    const updatedUserTeam = await UserTeam.findByIdAndUpdate(
      req.body.id,
      req.body,
      {
        new: true,
      }
    )
      .populate("userId", "username email")
      .populate("contestId", "entryFee prizePool status")
      .populate("matchId", "teamA teamB startTime")
      .populate("players", "name team role")
      .populate("captain", "name team role")
      .populate("viceCaptain", "name team role");
    if (!updatedUserTeam) {
      throw new ApiError(500, "User team not found");
    }
    // const savedUserTeam = await updatedUserTeam.save();
    res
      .status(200)
      .json(
        new ApiResponse(200, updateUserTeam, "User team updated successfully")
      );
  } catch (error) {
    console.log("Error while updating user team: ", error);
    throw new ApiError(400, "Error while updating User team");
  }
});

const deleteUserTeam = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const removedUserTeam = await UserTeam.findByIdAndDelete(id);
    // console.log("removed contest: ", removedContest);

    if (!removedUserTeam) {
      throw new ApiError(400, "Removed user team not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, {}, "User team with given id deleted successfully")
      );
  } catch (error) {
    console.log("Error in deleteing user team: ", error);
    throw new ApiError(500, "Error while deleting user team with given id");
  }
});

export {
  getAllUserTeams,
  getUserTeamById,
  createUserTeam,
  updateUserTeam,
  deleteUserTeam,
};
