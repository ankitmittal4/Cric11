import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Team } from "../models/team.model.js";
import jwt from "jsonwebtoken";

const getAllTeams = asyncHandler(async (req, res) => {
  try {
    const teams = await Team.find().populate("players", "name role");
    if (!teams) {
      throw new ApiError(400, "Teams not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, teams, "All Players fetched successfully"));
  } catch (error) {
    console.log("Error while fetching all teams: ", error);
    throw new ApiError(400, "Error while fetching all teams");
  }
});

const getTeamById = asyncHandler(async (req, res) => {
  try {
    const team = await Team.findById(req.body.id).populate(
      "players",
      "name role"
    );
    if (!team) {
      throw new ApiError(402, "Team with given id not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, team, "Team with given id fetched successfully")
      );
  } catch (error) {
    console.log("Error while fetching team with given id: ", error);
    throw new ApiError(400, "Error while fetching team with given id");
  }
});

const createTeam = asyncHandler(async (req, res) => {
  try {
    const { teamName, players } = req.body;
    if ([teamName].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
    const team = await Team.create({
      teamName,
      players,
    });
    if (!team) {
      throw new ApiError(500, "Error in creating team");
    }
    const savedTeam = await team.save();
    res
      .status(200)
      .json(new ApiResponse(200, savedTeam, "Team created successfully"));
  } catch (error) {
    console.log("Error while creating team: ", error);
    throw new ApiError(400, "Error while creating team");
  }
});

const updateTeam = asyncHandler(async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    }).populate("players", "name role");
    if (!updatedTeam) {
      throw new ApiError(500, "Team not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updateTeam, "Team updated successfully"));
  } catch (error) {
    console.log("Error while updating team: ", error);
    throw new ApiError(400, "Error while updating team");
  }
});

const deleteTeam = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const removedTeam = await Team.findByIdAndDelete(id);

    if (!removedTeam) {
      throw new ApiError(400, "Removed team not found");
    }
    res.status(200).json(new ApiResponse(200, {}, "Team deleted successfully"));
  } catch (error) {
    console.log("Error in deleteing team: ", error);
    throw new ApiError(500, error.message, "Error while deleting team");
  }
});

export { deleteTeam, updateTeam, createTeam, getAllTeams, getTeamById };
