import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Match } from "../models/match.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
// import { client } from "../redis/client.js";

const upcomingMatches = asyncHandler(async (req, res) => {
  try {
    const upcomingMatchesApiEndpoint = "cricScore";
    const upcomingMatchesApiUrl = `${process.env.API_URL}${upcomingMatchesApiEndpoint}?apikey=${process.env.API_KEY}`;
    const upcomingMatches = await axios.get(upcomingMatchesApiUrl);
    if (
      !(upcomingMatches.data.status === "success") ||
      !upcomingMatches.data.data.length
    ) {
      throw new ApiError(400, "Error while fetching data");
    }
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];
    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    const filteredMatches = upcomingMatches.data.data.filter((match) => {
      const matchTimeGMT = match.dateTimeGMT;
      const matchDateGMT = new Date(matchTimeGMT);
      const ISTOffset = 5.5 * 60 * 60 * 1000;
      const matchTimeIST = new Date(matchDateGMT.getTime() + ISTOffset);
      const matchTimeISTStr = matchTimeIST
        .toISOString()
        .replace("Z", "")
        .replace("T", " ")
        .slice(0, 10);
      return (
        match.ms === "fixture" &&
        (matchTimeISTStr === todayStr || matchTimeISTStr === tomorrowStr)
      );
    });
    console.log("filteredMatches: ", filteredMatches);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          filteredMatches,
          "All upcoming matches fetched successfully"
        )
      );
  } catch (error) {
    console.log("Error while fetching upcoming matches: ", error);
    throw new ApiError(500, "Error while fetching upcoming matches");
  }
});

const getAllMatches = asyncHandler(async (req, res) => {
  try {
    // const cachedMatches = await client.get("allMatches");
    // if (cachedMatches) {
    //   const parsedData = JSON.parse(cachedMatches);
    //   return res
    //     .status(200)
    //     .json(new ApiResponse(200, parsedData, "All matches fetched successfully"));
    // }
    const matches = await Match.find();
    // client.set("allMatches", JSON.stringify(matches), "EX", 600);
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
    const { id } = req.body;
    const match = await Match.findById(id);
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
    const { id } = req.body;
    const removedMatch = await Match.findByIdAndDelete(id);

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
