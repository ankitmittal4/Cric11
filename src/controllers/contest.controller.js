import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contest } from "../models/contest.model.js";
import { Match } from "../models/match.model.js";
import { Opponent } from "../models/opponent.model.js";
import { Player } from "../models/player.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import mongoose from "mongoose";
import { Transaction } from "../models/transaction.model.js";
import { format, toZonedTime } from "date-fns-tz";
import { UserContest } from "../models/userContest.model.js";

const getAllContestsOfGivenMatch = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    const contests = await Contest.aggregate([
      {
        $match: { matchRef: new mongoose.Types.ObjectId(id) },
      },
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
    // console.log("All Contests of given match: ", contests);
    // console.log("All Contests of given match: ", contests);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contests,
          "All contests of given match fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching contests of given match");
  }
});

const getAllContests = asyncHandler(async (req, res) => {
  try {
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

    // console.log("All Contests of given match: ", contests);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          contests,
          "All contests of given match fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching contests of given match");
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
            teamAAcronym: "$matchData.teamAAcronym",
            teamBAcronym: "$matchData.teamBAcronym",
            teamAImg: "$matchData.teamAImg",
            teamBImg: "$matchData.teamBImg",
            series: "$matchData.series",
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
  const {
    matchId,
    entryFee,
    prizePool,
    maxParticipants,
    t1,
    t2,
    t1img,
    t2img,
    series,
  } = req.body;

  if (
    [matchId, entryFee, prizePool, maxParticipants].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const isMatchPresent = await Match.findOne({ matchId });
  const matchSquad = await Player.findOne({ matchId });
  if (isMatchPresent) {
    const contest = await Contest.create({
      matchId,
      entryFee,
      prizePool,
      maxParticipants,
      matchRef: isMatchPresent._id,
      squadRef: matchSquad._id,
    });

    if (!contest) {
      throw new ApiError(
        500,
        "Something went wrong while creating a contest"
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(200, contest, "Contest created successfully"));
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
  const teamA = t1.split(" [")[0];
  const teamAAcronym = t1.match(/\[(.*?)\]/)?.[1];
  const teamB = t2.split(" [")[0];
  const teamBAcronym = t2.match(/\[(.*?)\]/)?.[1];

  const teamAImg = matchInfo?.data?.data?.teamInfo?.[0]?.img || t1img;
  const teamBImg = matchInfo?.data?.data?.teamInfo?.[1]?.img || t2img;

  //convert time
  const matchTimeGMT = dateTimeGMT;
  const matchDateGMT = new Date(matchTimeGMT + "Z");
  const istMatchDate = toZonedTime(matchDateGMT, "Asia/Kolkata");
  const formattedIstMatchDate = format(istMatchDate, "yyyy-MM-dd", {
    timeZone: "Asia/Kolkata",
  });
  const formattedIstMatchTime = format(istMatchDate, "HH:mm", {
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
  const { data } = matchSquadInfo.data;
  if (data.length === 0) {
    throw new ApiError(400, "Error due to squad not present");
  }

  // if ([teamName, players].some((field) => field?.trim() === "")) {
  //   throw new ApiError(400, "All fields are required");
  // }
  const match = await Match.create({
    matchId,
    matchType,
    name,
    teamA,
    teamB,
    teamAAcronym,
    teamBAcronym,
    teamAImg,
    teamBImg,
    series,
    date,
    startTime,
    venue,
    matchEnded,
    matchStarted,
  });
  if (!match) {
    throw new ApiError(500, "Something went wrong while creating a match");
  }

  const match_squad = await Player.create({
    matchId,
    squad: data,
  });
  if (!match_squad) {
    throw new ApiError(500, "Something went wrong while creating a squad");
  }

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

});

const deleteContest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const removedContest = await Contest.findByIdAndDelete(id);
    const isAnotherContestPresent = await Contest.findOne({
      matchRef: removedContest.matchRef,
    });


    if (!removedContest) {
      throw new ApiError(400, "Removed Contest not found");
    }

    const removedOpponent = await Opponent.deleteOne({ contestId: id });
    const removedUsercontest = await UserContest.deleteOne({ contestId: id });

    if (!isAnotherContestPresent) {
      //   console.log("More than 1 contest Not found for this ");
      const removedMatch = await Match.findByIdAndDelete(
        removedContest.matchRef
      );
      const removedSquad = await Player.findByIdAndDelete(
        removedContest.squadRef
      );
    }
    // console.log("removedOpponent: ", removedOpponent);
    // console.log("removedUsercontest: ", removedUsercontest);
    // if (
    //   !removedMatch ||
    //   !removedSquad ||
    //   !removedOpponent ||
    //   !removedUsercontest
    // ) {
    //   throw new ApiError(
    //     400,
    //     "Match, Players, Opponent, user contest with corresponding contest not found"
    //   );
    // }

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
    // console.log("UpdatedContest", updateContest);
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
  getAllContestsOfGivenMatch,
  getAllContests,
  getContestById,
  createContest,
  deleteContest,
  updateContest,
};
