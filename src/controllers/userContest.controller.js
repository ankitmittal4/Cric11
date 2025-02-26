import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model.js";
import { Contest } from "../models/contest.model.js";
import mongoose from "mongoose";
import axios from "axios";
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
          from: "matches",
          localField: "matchId",
          foreignField: "_id",
          as: "matchData",
        },
      },
      {
        $unwind: "$matchData",
      },
      {
        $project: {
          contestDetails: {
            entryFee: "$userContestData.entryFee",
            prizePool: "$userContestData.prizePool",
            maxParticipants: "$userContestData.maxParticipants",
          },
          user11: "$playing11",
          matchDetails: {
            name: "$matchData.name",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            matchType: "$matchData.matchType",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
            teamAImg: "$matchData.teamAImg",
            teamBImg: "$matchData.teamBImg",
          },
        },
      },
    ]);
    // console.log("All userContests: ", userContests);
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

const getUserContestsById = asyncHandler(async (req, res) => {
  //   console.log("+++++++++++++++++");
  try {
    // console.log(req.body);
    const { id } = req.body;
    // let userId;
    // if (req.body.userId) {
    //   userId = req.body.userId;
    // } else {
    //   userId = req.user.id;
    // }
    const userId = req.user.id;
    // console.log("User id: ", userId);
    const userContest = await UserContest.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
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
          from: "matches",
          localField: "matchId",
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
          let: { squadId: "$userContestData.squadRef" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$squadId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "squad",
        },
      },
      {
        $unwind: "$squad",
      },
      {
        $project: {
          playersIds: "$players",
          team1: {
            $arrayElemAt: ["$squad.squad", 0],
          },
          team2: {
            $arrayElemAt: ["$squad.squad", 1],
          },
          userContestData: "$userContestData",
          matchData: "$matchData",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
          userId: "$userId",
          contestId: "$contestId",
          points: "$points",
          result: "$result",
        },
      },
      {
        $project: {
          playersIds: "$playersIds",
          players: {
            $concatArrays: ["$team1.players", "$team2.players"],
          },
          userContestData: "$userContestData",
          matchData: "$matchData",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
          userId: "$userId",
          contestId: "$contestId",
          points: "$points",
          result: "$result",
        },
      },
      {
        $addFields: {
          playing11: {
            $filter: {
              input: "$players",
              as: "player",
              cond: {
                $in: ["$$player.id", "$playersIds"],
              },
            },
          },
        },
      },
      {
        $project: {
          contestDetails: {
            entryFee: "$userContestData.entryFee",
            prizePool: "$userContestData.prizePool",
            maxParticipants: "$userContestData.maxParticipants",
          },
          user11: "$playing11",
          matchDetails: {
            name: "$matchData.name",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            matchType: "$matchData.matchType",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
          },
          userId: 1,
          captain: 1,
          viceCaptain: 1,
          contestId: 1,
          points: "$points",
          result: "$result",
        },
      },
    ]);

    // console.log("userContest: ", userContest);
    if (!userContest || userContest.length === 0) {
      return res
        .status(404)
        .json({ message: "No contests found for this user with given id." });
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userContest,
          "user contest with given id fetched successfully"
        )
      );
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while fetching user contest with given id");
  }
});
const updateUserContestsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;

    const userContest = await UserContest.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
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
          from: "matches",
          localField: "matchId",
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
          let: { squadId: "$userContestData.squadRef" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$squadId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "squad",
        },
      },
      {
        $unwind: "$squad",
      },
      {
        $project: {
          playersIds: "$players",
          team1: {
            $arrayElemAt: ["$squad.squad", 0],
          },
          team2: {
            $arrayElemAt: ["$squad.squad", 1],
          },
          userContestData: "$userContestData",
          matchData: "$matchData",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
        },
      },
      {
        $project: {
          playersIds: "$playersIds",
          players: {
            $concatArrays: ["$team1.players", "$team2.players"],
          },
          userContestData: "$userContestData",
          matchData: "$matchData",
          captain: "$captain", // Include captain here as well
          viceCaptain: "$viceCaptain", // Include captain here as well
        },
      },
      {
        $addFields: {
          playing11: {
            $filter: {
              input: "$players",
              as: "player",
              cond: {
                $in: ["$$player.id", "$playersIds"],
              },
            },
          },
        },
      },
      {
        $project: {
          //   contestDetails: {
          //     entryFee: "$userContestData.entryFee",
          //     prizePool: "$userContestData.prizePool",
          //     maxParticipants: "$userContestData.maxParticipants",
          //   },
          user11: "$playing11",
          matchDetails: {
            // name: "$matchData.name",
            // teamA: "$matchData.teamA",
            // teamB: "$matchData.teamB",
            // matchType: "$matchData.matchType",
            matchId: "$matchData.matchId",
            // date: "$matchData.date",
            // startTime: "$matchData.startTime",
          },
          captain: 1, // Keep this line to ensure captain is in the final response
          viceCaptain: 1,
        },
      },
    ]);
    // console.log("Update UserContest: ", userContest[0].user11);
    // console.log("Update UserContest: ", userContest[0].captain);
    // console.log("Update UserContest: ", userContest[0].viceCaptain);

    //NOTE: fetch points from fantasy match points API
    const matchId = userContest[0].matchDetails.matchId;
    const fantasyMatchatchPointsEndPoint = "match_points";
    const fantasyMatchPointsApiUrl = `${process.env.API_URL}${fantasyMatchatchPointsEndPoint}?apikey=${process.env.API_KEY}&id=${matchId}`;
    try {
      const fantasyPoints = await axios.get(fantasyMatchPointsApiUrl);
      if (fantasyPoints.data.status === "success") {
        // console.log(fantasyPoints.data.data.totals);

        //NOTE: matching both user11 and fantasy data to calculate match points
        const fantasyData = fantasyPoints.data.data.totals;
        const user11 = userContest[0].user11;
        // console.log("User11", user11);
        const fantasyDataLookup = fantasyData.reduce((acc, player) => {
          acc[player.id] = player.points;
          return acc;
        }, {});

        //Calculate the sum of points for matching players
        let totalPoints = 0;
        user11.forEach((player) => {
          const playerId = player.id.toString();
          if (fantasyDataLookup[playerId]) {
            totalPoints += fantasyDataLookup[playerId];
          }
        });
        console.log("Total Points: ", totalPoints);
        //update points in database
        const updateUserContest = await UserContest.findByIdAndUpdate(
          id,
          {
            $set: {
              points: totalPoints,
            },
          },
          {
            new: true,
          }
        );
        console.log("updateUserContest: ", UserContest);
      } else {
        console.log(
          "Failure in getting api response: ",
          fantasyPoints.data.reason
        );
      }
    } catch {
      console.log("Error in getting fantasy points");
      throw new ApiError(500, "Error in getting fantasy points");
    }

    //FIXME: get user contest code

    // console.log("userContest: ", userContest);
    if (!userContest || userContest.length === 0) {
      return res
        .status(404)
        .json({ message: "No contests found for this user with given id." });
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userContest,
          "user contest with given id fetched successfully"
        )
      );
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while fetching user contest with given id");
  }
});

export {
  createUserContest,
  getAllUserContests,
  getUserContestsById,
  updateUserContestsById,
};
