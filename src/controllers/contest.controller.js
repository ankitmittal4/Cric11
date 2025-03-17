import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contest } from "../models/contest.model.js";
import { Match } from "../models/match.model.js";
import { Player } from "../models/player.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import { Transaction } from "../models/transaction.model.js";
import { format, toZonedTime } from "date-fns-tz";

const getAllContests = asyncHandler(async (req, res) => {
  try {
    // const contests = await Contest.find().populate(
    //   "matchRef",
    //   "matchType name teamA teamB startTime venue"
    // );

    const contests = await Contest.aggregate([
      {
        $lookup: {
          from: "matches",
          localField: "matchRef",
          foreignField: "_id",
          as: "match",
        },
      },
      {
        $unwind: "$match",
      },
    ]);

    // console.log("All Contests: ", contests);
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

    //POPULATE
    // const contest = await Contest.findById(id).populate(
    //   "matchRef squadRef",
    //   "matchType name teamA teamB startTime venue date squad"
    // );

    //AGGREGATION
    const contest = await Contest.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "matches",
          localField: "matchRef",
          foreignField: "_id",
          as: "matchData",
        },
      },
      {
        $unwind: "$matchData",
      },
      {
        $lookup: {
          from: "players",
          localField: "squadRef",
          foreignField: "_id",
          as: "squadData",
        },
      },
      {
        $unwind: "$squadData",
      },
      {
        $project: {
          _id: 1,
          prizePool: 1,
          entryFee: 1,
          maxParticipants: 1,
          matchDetails: {
            matchType: "$matchData.matchType",
            name: "$matchData.name",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            startTime: "$matchData.startTime",
            date: "$matchData.date",
            venue: "$matchData.venue",
          },
          squadDetails: {
            squad: "$squadData.squad",
          },
        },
      },
    ]);
    // console.log("contest: ", contest);
    if (!contest || contest.length === 0) {
      throw new ApiError(400, "Contest not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contest[0],
          "Contest with given id fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching contest with given id");
  }
});

const createContest = asyncHandler(async (req, res) => {
  try {
    const { matchId, entryFee, prizePool, maxParticipants } = req.body;
    if (
      [matchId, entryFee, prizePool, maxParticipants].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    //api call for matchInfo
    const matchInfoApiEndpoint = "match_info";
    const matchInfoApiUrl = `${process.env.API_URL}${matchInfoApiEndpoint}?apikey=${process.env.API_KEY}&id=${matchId}`;
    let matchInfo;
    try {
      matchInfo = await axios.get(matchInfoApiUrl);
      if (matchInfo?.data.status === "failure") {
        console.log("Error in match info api: ", matchInfo?.data.reason);
        throw new ApiError(400, matchInfo?.data.reason);
      }
    } catch (error) {
      console.log("Error while getting match info: ", error);
      throw new ApiError(400, error);
    }
    // console.log("Step 2: ", matchInfo);

    //   console.log("matchInfo::: ", matchInfo);
    const {
      name,
      matchType,
      venue,
      teams,
      dateTimeGMT,
      matchEnded,
      matchStarted,
    } = matchInfo?.data?.data;
    const teamA = teams[0];
    const teamB = teams[1];
    const teamAImg = matchInfo?.data?.data?.teamInfo?.[0]?.img;
    const teamBImg = matchInfo?.data?.data?.teamInfo?.[1]?.img;

    //convert time
    const matchTimeGMT = dateTimeGMT;
    const matchDateGMT = new Date(matchTimeGMT + "Z");
    const istMatchDate = toZonedTime(matchDateGMT, "Asia/Kolkata");
    const formattedIstMatchDate = format(istMatchDate, "yyyy-MM-dd", {
      timeZone: "Asia/Kolkata",
    });
    const formattedIstMatchTime = format(istMatchDate, "HH:mm:ss", {
      timeZone: "Asia/Kolkata",
    });
    const date = formattedIstMatchDate;
    const startTime = formattedIstMatchTime;
    if (
      [matchId, name, matchType, teamA, teamB, startTime, date, venue].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const match = await Match.create({
      matchId,
      matchType,
      name,
      teamA,
      teamB,
      teamAImg,
      teamBImg,
      date,
      startTime,
      venue,
      matchEnded,
      matchStarted,
    });
    if (!match) {
      throw new ApiError(500, "Something went wrong while creating a match");
    }

    //FIXME: players database call
    const matchSquadApiEndpoint = "match_squad";
    const matchSquadApiUrl = `${process.env.API_URL}${matchSquadApiEndpoint}?apikey=${process.env.API_KEY}&id=${matchId}`;
    let matchSquadInfo;
    try {
      matchSquadInfo = await axios.get(matchSquadApiUrl);
      if (matchSquadInfo?.data.status === "failure") {
        console.log("Error in match info api: ", matchSquadInfo?.data.reason);
        throw new ApiError(400, matchSquadInfo?.data.reason);
      }
    } catch (error) {
      console.log("Error while fetching match squad");
      throw new ApiError(400, error);
    }
    //   console.log("matchInfo::: ", matchInfo.data.data);
    const { data } = matchSquadInfo.data;

    // if ([teamName, players].some((field) => field?.trim() === "")) {
    //   throw new ApiError(400, "All fields are required");
    // }

    const match_squad = await Player.create({
      matchId,
      squad: data,
    });
    if (!match_squad) {
      throw new ApiError(500, "Something went wrong while creating a squad");
    }
    //FIXME: squad/player controller done

    const matchRef = match._id;
    const squadRef = match_squad._id;
    const contest = await Contest.create({
      matchId,
      entryFee,
      prizePool,
      maxParticipants,
      matchRef,
      squadRef,
    });

    if (!contest) {
      throw new ApiError(500, "Something went wrong while creating a contest");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, contest, "Contest created successfully"));
  } catch (error) {
    console.log("Error in Ankit", error);
  }
});

const deleteContest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const removedContest = await Contest.findByIdAndDelete(id);

    // console.log("removedContest: ", removedContest);

    if (!removedContest) {
      throw new ApiError(400, "Removed Contest not found");
    }

    const removedMatch = await Match.findByIdAndDelete(removedContest.matchRef);
    const removedSquad = await Player.findByIdAndDelete(
      removedContest.squadRef
    );
    if (!removedMatch || !removedSquad) {
      throw new ApiError(
        400,
        "Match and Players with corresponding contest not found"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Contest with given id deleted successfully")
      );
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while deleting contest with given id");
  }
});

const updateContest = asyncHandler(async (req, res) => {
  try {
    // console.log("req.body: ", req.body);
    const { id, data } = req.body;
    if (!id) {
      throw new ApiError(400, "Id is required");
    }
    const updateContest = await Contest.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      {
        new: true,
      }
    ).populate("matchId", "_id sport");
    if (!updateContest) {
      throw new ApiError(404, "Contest not found");
    }
    console.log("UpdatedContest", updateContest);
    res
      .status(200)
      .json(
        new ApiResponse(200, updateContest, "Contest updated successfully")
      );
  } catch (error) {
    console.log("Error in updating contest: ", error);
    throw new ApiError(500, "Error in updating contest");
  }
});

export {
  getAllContests,
  getContestById,
  createContest,
  deleteContest,
  updateContest,
};
