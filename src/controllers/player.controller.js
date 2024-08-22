import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Player } from "../models/player.model.js";
import jwt from "jsonwebtoken";

const getAllPlayers = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find().populate(
      "matchId",
      "teamA teamB startTime"
    );
    console.log("players: ", players);
    // .populate("teamId", "teamName");
    if (!players) {
      throw new ApiError(400, "Players not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, players, "All Players fetched successfully"));
  } catch (error) {
    console.log("Error while fetching all players: ", error);
    throw new ApiError(400, "Error while fetching all players");
  }
});

const getPlayerById = asyncHandler(async (req, res) => {
  try {
    const player = await Player.findById(req.body.id).populate(
      "matchId",
      "teamA teamB startTime"
    );
    // .populate("teamId", "teamName");
    if (!player) {
      throw new ApiError(402, "Player with given id not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          player,
          "Player with given id fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error while fetching player with given id: ", error);
    throw new ApiError(400, "Error while fetching player with given id");
  }
});
const createPlayer = asyncHandler(async (req, res) => {
  try {
    const { name, team, role, credits, matchId, teamId } = req.body;
    if (
      [name, team, role, credits, matchId, teamId].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const player = await Player.create({
      name,
      team,
      role,
      credits,
      matchId,
      teamId,
    });
    if (!player) {
      throw new ApiError(500, "Error in creating player");
    }
    const savedPlayer = await player.save();
    res
      .status(200)
      .json(new ApiResponse(200, savedPlayer, "Player created successfully"));
  } catch (error) {
    console.log("Error while creating Player: ", error);
    throw new ApiError(400, "Error while creating Player");
  }
});
const updatePlayer = asyncHandler(async (req, res) => {
  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.body.id,
      req.body,
      {
        new: true,
      }
    ).populate("matchId", "teamA teamB startTime");
    // .populate("teamId", "teamName");
    if (!updatedPlayer) {
      throw new ApiError(500, "Player not found");
    }
    // const savedUserTeam = await updatedUserTeam.save();
    res
      .status(200)
      .json(new ApiResponse(200, updatePlayer, "Player updated successfully"));
  } catch (error) {
    console.log("Error while updating player: ", error);
    throw new ApiError(400, "Error while updating player");
  }
});

const deletePlayer = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const removedPlayer = await Player.findByIdAndDelete(id);
    // console.log("removed contest: ", removedContest);

    if (!removedPlayer) {
      throw new ApiError(400, "Removed player not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Player deleted successfully"));
  } catch (error) {
    console.log("Error in deleteing player: ", error);
    throw new ApiError(500, error.message, "Error while deleting player");
  }
});

export {
  deletePlayer,
  updatePlayer,
  createPlayer,
  getAllPlayers,
  getPlayerById,
};
