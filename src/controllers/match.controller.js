import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/match.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";

//matches list
// const apikey = "8c0c86ef-350f-436f-bf8a-d57ca0af5db5";
// const offset = 0;
// const url = `https://api.cricapi.com/v1/matches?apikey=8c0c86ef-350f-436f-bf8a-d57ca0af5db5&offset=0`;
// axios
//   .get(url)
//   .then((response) => {
//     console.log("Match api rsponse: ", response.data);
//   })
//   .catch((err) => {
//     console.log("Error in match api: ", err);
//   });

const upcomingMatches = asyncHandler(async (req, res) => {
  try {
    const upcomingMatchesApiEndpoint = "cricScore";
    const upcomingMatchesApiUrl = `${process.env.API_URL}${upcomingMatchesApiEndpoint}?apikey=${process.env.API_KEY}`;
    const upcomingMatches = await axios.get(upcomingMatchesApiUrl);
    if (
      !(upcomingMatches.data.status === "success") ||
      !upcomingMatches.data.length
    ) {
      throw new ApiError(400, "Error while fetching data");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          upcomingMatches.data,
          "All matches fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error while fetching all matches: ", error);
    throw new ApiError(500, "Error while fetching matches");
  }
});
const getAllMatches = asyncHandler(async (req, res) => {
  try {
    const matches = await Match.find();
    // console.log("All Matches: ", contests);
    res
      .status(200)
      .json(new ApiResponse(200, matches, "All matches fetched successfully"));
  } catch (error) {
    console.log("Error while fetching all matches: ", error);
    throw new ApiError(500, "Error while fetching matches");
  }
});
const getMatchById = asyncHandler(async (req, res) => {
  try {
    // console.log("req.params: ", req.params);
    const { id } = req.body;
    const match = await Match.findById(id);
    // console.log("Contest with given id: ", contest);
    if (!match) {
      throw new ApiError(400, "Match not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, match, "Match with given id fetched successfully")
      );
  } catch (error) {
    console.log("Error in fetching match with given id: ", error);
    throw new ApiError(500, "Error while fetching match with given id");
  }
});

const createMatch = asyncHandler(async (req, res) => {
  const { matchId, sport, teamA, teamB, startTime, endTime, status, venue } =
    req.body;
  if (
    [matchId, sport, teamA, teamB, startTime, endTime, status, venue].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const match = await Match.create({
    matchId,
    sport,
    teamA,
    teamB,
    startTime,
    endTime,
    status,
    venue,
  });
  if (!match) {
    throw new ApiError(500, "Something went wrong while creating a match");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, match, "Match created successfully"));
});

const deleteMatch = asyncHandler(async (req, res) => {
  try {
    // console.log("req.params: ", req.params);
    const { id } = req.body;
    // console.log("id: ", id);
    const removedMatch = await Match.findByIdAndDelete(id);
    // console.log("removed contest: ", removedContest);

    if (!removedMatch) {
      throw new ApiError(400, "Removed Match not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Match with given id deleted successfully")
      );
  } catch (error) {
    console.log("Error in deleteing match: ", error);
    throw new ApiError(500, "Error while deleting match with given id");
  }
});

export {
  getAllMatches,
  getMatchById,
  createMatch,
  deleteMatch,
  upcomingMatches,
};
