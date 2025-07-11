import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserContest } from "../models/userContest.model.js";
import { Contest } from "../models/contest.model.js";
import { Transaction } from "../models/transaction.model.js";
import { User } from "../models/user.model.js";
import mongoose, { Mongoose } from "mongoose";
import axios from "axios";
import { Match } from "../models/match.model.js";

const createUserContest = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const contest = await Contest.findById(req.body.contestId);
    const { contestId, players, captain, viceCaptain } = req.body;
    const updatedPlayers = players.map((playerId) => ({
      id: playerId,
      //   points: 0,
    }));
    const userContest = new UserContest({
      userId: _id,
      matchId: contest.matchRef,
      contestId,
      players: updatedPlayers,
      captain,
      viceCaptain,
    });

    const user = await User.findById(_id);
    const { walletBalance } = user;

    // Check if wallet balance is sufficient
    if (walletBalance < contest.entryFee) {
      return res.status(404).json({
        message: "You don't have enough balance to play this contest",
      });
    }

    // Deduct entry fee from wallet balance
    const remBalance = walletBalance - contest.entryFee;
    await User.findByIdAndUpdate(
      _id,
      { walletBalance: remBalance },
      { new: true }
    );

    // Create a transaction record
    const transaction = await Transaction.create({
      userId: _id,
      amount: contest.entryFee,
      transactionType: "debit",
      transactionStatus: "success",
      message: "Contest Joined"
    });

    // Save the user contest
    const savedUserContest = await userContest.save();

    // Send success response
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

const updateTeam = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id, players, captain, viceCaptain } = req.body;
  //   console.log("Response: ", req.body);
  const updatedPlayers = players.map((playerId) => ({
    id: playerId,
    //   points: 0,
  }));

  try {
    const updateTeam = await UserContest.findByIdAndUpdate(
      id,
      {
        $set: {
          players: updatedPlayers,
          captain: captain,
          viceCaptain: viceCaptain,
        },
      },
      { new: true }
    );
    // console.log("Update Team", updateTeam);
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
            $map: {
              input: {
                $filter: {
                  input: "$players",
                  as: "player",
                  cond: {
                    $in: [
                      "$$player.id",
                      {
                        $map: {
                          input: "$playersIds",
                          as: "pid",
                          in: "$$pid.id",
                        },
                      },
                    ],
                  },
                },
              },
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    $let: {
                      vars: {
                        playerPoints: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$playersIds",
                                as: "pid",
                                cond: { $eq: ["$$pid.id", "$$player.id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        points: "$$playerPoints.points",
                      },
                    },
                  },
                ],
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
            series: "$matchData.series",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            teamAAcronym: "$matchData.teamAAcronym",
            teamBAcronym: "$matchData.teamBAcronym",
            matchType: "$matchData.matchType",
            venue: "$matchData.venue",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
            matchStarted: "$matchData.matchStarted",
            matchEnded: "$matchData.matchEnded",
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
    // console.log("User contest: ", userContest);
    res
      .status(201)
      .json(
        new ApiResponse(200, userContest, "User contest Updated successfully")
      );
  } catch {
    console.log("Error while updating team: ", error);
    throw new ApiError(400, "Error while updating team");
  }
});

const getAllUserContests = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    //NOTE:Update status of match
    //---------------START--------------------------
    // const upcomingMatchesEndPoint = "cricScore";
    // const upcomingMatchesApiUrl = `${process.env.API_URL}${upcomingMatchesEndPoint}?apikey=${process.env.API_KEY}`;
    // const response = await axios.get(upcomingMatchesApiUrl);
    // if (!(response.data.status === "success") || !response.data.data.length) {
    //   console.log("Error in getting upcoming matches in Backend");
    // }
    // const allmatches = response.data.data;
    // const match = await Match.find();
    // const matchIds = match.map((match) => {
    //   return {
    //     matchId: match.matchId,
    //   };
    // });
    // const matchIds = match.map((match) => ({
    //   matchId: match.matchId,
    // }));
    // const matchIds = match.map((match) => match.matchId);
    // console.log("Match: ", matchIds);

    // for (const match of allmatches) {
    //   const isMatchExist = matchIds.some((item) => (item.matchId = match.id));
    //   if (isMatchExist) {
    //     await Match.findOneAndUpdate(
    //       { matchId: match.id },
    //       {
    //         $set: {
    //           matchStarted:
    //             match.ms === "result" || match.ms === "live" ? true : false,
    //           matchEnded: match.ms === "result" ? true : false,
    //         },
    //       },
    //       { new: true }
    //     );
    //   }
    // }
    //------------------END------------------
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
            series: "$matchData.series",
            matchType: "$matchData.matchType",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
            teamAImg: "$matchData.teamAImg",
            teamBImg: "$matchData.teamBImg",
            teamAAcronym: "$matchData.teamAAcronym",
            teamBAcronym: "$matchData.teamBAcronym",
            matchEnded: "$matchData.matchEnded",
            matchStarted: "$matchData.matchStarted",
          },
        },
      },
    ]);
    // console.log("All userContests: ", userContests);
    if (!userContests || userContests.length === 0) {
      return res
        .status(200)
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
  //   console.log("+++++++++++++++++++");
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
            $map: {
              input: {
                $filter: {
                  input: "$players",
                  as: "player",
                  cond: {
                    $in: [
                      "$$player.id",
                      {
                        $map: {
                          input: "$playersIds",
                          as: "pid",
                          in: "$$pid.id",
                        },
                      },
                    ],
                  },
                },
              },
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    $let: {
                      vars: {
                        playerPoints: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$playersIds",
                                as: "pid",
                                cond: { $eq: ["$$pid.id", "$$player.id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        points: "$$playerPoints.points",
                      },
                    },
                  },
                ],
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
            series: "$matchData.series",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            teamAAcronym: "$matchData.teamAAcronym",
            teamBAcronym: "$matchData.teamBAcronym",
            matchType: "$matchData.matchType",
            venue: "$matchData.venue",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
            matchStarted: "$matchData.matchStarted",
            matchEnded: "$matchData.matchEnded",
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
    const { id, opponentId } = req.body;
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
          userId: "$userId",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
          points: "$points",
          result: "$result",
          n: "$n",
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
          userId: "$userId",
          captain: "$captain", // Include captain here as well
          viceCaptain: "$viceCaptain", // Include captain here as well
          points: "$points",
          result: "$result",
          n: "$n",
        },
      },
      {
        $addFields: {
          playing11: {
            $map: {
              input: {
                $filter: {
                  input: "$players",
                  as: "player",
                  cond: {
                    $in: [
                      "$$player.id",
                      {
                        $map: {
                          input: "$playersIds",
                          as: "pid",
                          in: "$$pid.id",
                        },
                      },
                    ],
                  },
                },
              },
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    $let: {
                      vars: {
                        playerPoints: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$playersIds",
                                as: "pid",
                                cond: { $eq: ["$$pid.id", "$$player.id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        points: "$$playerPoints.points",
                      },
                    },
                  },
                ],
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
            series: "$matchData.series",
            teamA: "$matchData.teamA",
            teamB: "$matchData.teamB",
            teamAAcronym: "$matchData.teamAAcronym",
            teamBAcronym: "$matchData.teamBAcronym",
            matchType: "$matchData.matchType",
            venue: "$matchData.venue",
            matchId: "$matchData.matchId",
            date: "$matchData.date",
            startTime: "$matchData.startTime",
            matchStarted: "$matchData.matchStarted",
            matchEnded: "$matchData.matchStarted",
          },
          userId: "$userId",
          captain: 1, // Keep this line to ensure captain is in the final response
          viceCaptain: 1,
          points: "$points",
          result: "$result",
          n: "$n",
        },
      },
    ]);

    const opponentContest = await UserContest.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(opponentId) },
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
          userId: "$userId",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
          points: "$points",
          result: "$result",
          n: "$n",
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
          userId: "$userId",
          captain: "$captain",
          viceCaptain: "$viceCaptain",
          points: "$points",
          result: "$result",
          n: "$n",
        },
      },
      {
        $addFields: {
          playing11: {
            $map: {
              input: {
                $filter: {
                  input: "$players",
                  as: "player",
                  cond: {
                    $in: [
                      "$$player.id",
                      {
                        $map: {
                          input: "$playersIds",
                          as: "pid",
                          in: "$$pid.id",
                        },
                      },
                    ],
                  },
                },
              },
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    $let: {
                      vars: {
                        playerPoints: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$playersIds",
                                as: "pid",
                                cond: { $eq: ["$$pid.id", "$$player.id"] },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: {
                        points: "$$playerPoints.points",
                      },
                    },
                  },
                ],
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
            // name: "$matchData.name",
            // teamA: "$matchData.teamA",
            // teamB: "$matchData.teamB",
            // matchType: "$matchData.matchType",
            matchId: "$matchData.matchId",
            // date: "$matchData.date",
            // startTime: "$matchData.startTime",
          },
          userId: "$userId",
          captain: 1, // Keep this line to ensure captain is in the final response
          viceCaptain: 1,
          points: "$points",
          result: "$result",
          n: "$n",
        },
      },
    ]);

    //NOTE: fetch points from fantasy match points API
    const matchId = userContest[0].matchDetails.matchId;
    const fantasyMatchatchPointsEndPoint = "match_bbb";
    const fantasyMatchPointsApiUrl = `${process.env.API_URL}${fantasyMatchatchPointsEndPoint}?apikey=${process.env.API_KEY}&id=${matchId}`;

    try {
      const data = await Match.findOneAndUpdate(
        { matchId: matchId },
        {
          $set: {
            matchStarted: true,
          },
        },
        { new: true }
      );
      const fantasyPoints = await axios.get(fantasyMatchPointsApiUrl);
      if (fantasyPoints.data.status === "success") {
        const isMatchEnded = fantasyPoints?.data?.data?.matchEnded;
        const matchId = userContest[0].matchDetails.matchId;
        if (isMatchEnded) {
          const data = await Match.findOneAndUpdate(
            { matchId: matchId },
            {
              $set: {
                // matchStarted: true,
                matchEnded: isMatchEnded,
              },
            },
            { new: true }
          );
        }
        if (isMatchEnded && userContest[0].result != null) {
          return res.status(200).json(
            new ApiResponse(
              200,
              {
                updatedUserContest: userContest,
                updatedOpponentContest: opponentContest,
              },
              "user contest with given id fetched successfully"
            )
          );
        }

        const n = userContest[0]?.n || opponentContest[0]?.n;
        const bbb = fantasyPoints?.data?.data?.bbb; //it is an array
        const filterbbb = bbb.filter((ball) => ball.n > n);
        const fantasyDataLookup = filterbbb.reduce((acc, ball) => {
          acc[ball?.batsman?.id] = acc[ball?.batsman?.id] || 0;
          acc[ball?.bowler?.id] = acc[ball?.bowler?.id] || 0;

          if (ball?.dismissal) {
            acc[ball?.bowler.id] += 30;
          } else if (ball?.penalty) {
            acc[ball?.bowler.id] -= ball?.extras || 0;
          } else {
            acc[ball?.batsman.id] += ball?.runs || 0;
            if (ball?.runs === 4 || ball?.runs === 6) {
              acc[ball?.batsman.id] += ball?.runs === 4 ? 1 : 2;
              acc[ball?.bowler.id] -= ball?.runs === 4 ? 1 : 2;
            }
          }
          return acc;
        }, {});
        const updatedn = bbb[bbb.length - 1].n;
        const user11 = userContest[0].user11;
        const opponent11 = opponentContest[0].user11;

        let totalPointsOfUser = userContest[0]?.points;
        let totalPointsOfOpponent = opponentContest[0]?.points;
        const updatedUserPlayers = user11.map((player) => {
          const playerId = player.id.toString();
          let points = fantasyDataLookup[playerId] || 0;

          if (playerId === userContest[0].captain) {
            points *= 2;
          } else if (playerId === userContest[0].viceCaptain) {
            points *= 1.5;
          }
          totalPointsOfUser += points;
          return {
            id: player.id,
            points: points + player.points,
            // points: 0,
          };
        });
        const updatedOpponentPlayers = opponent11.map((player) => {
          const playerId = player.id.toString();
          let points = fantasyDataLookup[playerId] || 0;

          if (playerId === opponentContest[0].captain) {
            points *= 2;
          } else if (playerId === opponentContest[0].viceCaptain) {
            points *= 1.5;
          }
          totalPointsOfOpponent += points;
          return {
            id: player.id,
            points: points + player.points,
            // points: 0,
          };
        });

        let userResult;
        let opponentResult;
        let winnerId;
        if (isMatchEnded) {
          if (totalPointsOfUser > totalPointsOfOpponent) {
            userResult = "win";
            opponentResult = "loose";
            winnerId = userContest[0]?.userId;
          } else {
            userResult = "loose";
            opponentResult = "win";
            winnerId = opponentContest[0]?.userId;
          }
          const transaction = await Transaction.create({
            userId: winnerId,
            amount: userContest[0]?.contestDetails?.prizePool,
            transactionType: "credit",
            transactionStatus: "success",
            message: "Contest Winning",
          });
        }

        await UserContest.bulkWrite([
          {
            updateOne: {
              filter: { _id: id },

              update: {
                $set: {
                  players: updatedUserPlayers,
                  points: totalPointsOfUser,
                  result: isMatchEnded ? userResult : null,
                  n: updatedn,
                },
              },
            },
          },
          {
            updateOne: {
              filter: { _id: opponentId },
              update: {
                $set: {
                  players: updatedOpponentPlayers,
                  points: totalPointsOfOpponent,
                  result: isMatchEnded ? opponentResult : null,
                  n: updatedn,
                },
              },
            },
          },
        ]);

        const updatedUserContest = await UserContest.aggregate([
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
              captain: "$captain", // Include captain here as well
              viceCaptain: "$viceCaptain", // Include captain here as well
              points: "$points",
              result: "$result",
            },
          },
          {
            $addFields: {
              playing11: {
                $map: {
                  input: {
                    $filter: {
                      input: "$players",
                      as: "player",
                      cond: {
                        $in: [
                          "$$player.id",
                          {
                            $map: {
                              input: "$playersIds",
                              as: "pid",
                              in: "$$pid.id",
                            },
                          },
                        ],
                      },
                    },
                  },
                  as: "player",
                  in: {
                    $mergeObjects: [
                      "$$player",
                      {
                        $let: {
                          vars: {
                            playerPoints: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$playersIds",
                                    as: "pid",
                                    cond: { $eq: ["$$pid.id", "$$player.id"] },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            points: "$$playerPoints.points",
                          },
                        },
                      },
                    ],
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
                matchDetails: {
                  name: "$matchData.name",
                  series: "$matchData.series",
                  teamA: "$matchData.teamA",
                  teamB: "$matchData.teamB",
                  teamAAcronym: "$matchData.teamAAcronym",
                  teamBAcronym: "$matchData.teamBAcronym",
                  matchType: "$matchData.matchType",
                  venue: "$matchData.venue",
                  date: "$matchData.date",
                  startTime: "$matchData.startTime",
                  matchStarted: "$matchData.matchStarted",
                  matchEnded: "$matchData.matchEnded",
                },
              },
              captain: 1, // Keep this line to ensure captain is in the final response
              viceCaptain: 1,
              points: "$points",
              result: "$result",
            },
          },
        ]);

        const updatedOpponentContest = await UserContest.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(opponentId) },
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
              points: "$points",
              result: "$result",
            },
          },
          {
            $addFields: {
              playing11: {
                $map: {
                  input: {
                    $filter: {
                      input: "$players",
                      as: "player",
                      cond: {
                        $in: [
                          "$$player.id",
                          {
                            $map: {
                              input: "$playersIds",
                              as: "pid",
                              in: "$$pid.id",
                            },
                          },
                        ],
                      },
                    },
                  },
                  as: "player",
                  in: {
                    $mergeObjects: [
                      "$$player",
                      {
                        $let: {
                          vars: {
                            playerPoints: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$playersIds",
                                    as: "pid",
                                    cond: { $eq: ["$$pid.id", "$$player.id"] },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            points: "$$playerPoints.points",
                          },
                        },
                      },
                    ],
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
              points: "$points",
              result: "$result",
            },
          },
        ]);
        if (
          !updatedUserContest ||
          updatedUserContest.length === 0 ||
          !updatedOpponentContest ||
          updatedOpponentContest.length === 0
        ) {
          return res.status(404).json({
            message: "No contests found for this user with given id.",
          });
        }
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { updatedUserContest, updatedOpponentContest },
              "user contest with given id fetched successfully"
            )
          );
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
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while fetching user contest with given id");
  }
});

const deleteUserContestsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user._id;

    //Find user contest and delete it
    const userContest = await UserContest.findByIdAndDelete(id);
    if (!userContest) {
      return res.status(404).json(new ApiError(404, "User contest not found"));
    }

    const { contestId } = userContest;
    //Find contest and fetch entryFee
    const contest = await Contest.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(contestId) }
      },
      {
        $project: {
          entryFee: 1,
        }
      }
    ])
    const entryFee = contest[0]?.entryFee;

    //Find user and update wallet balance to add entryFee
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    const { walletBalance } = user;
    const updateBalance = walletBalance + entryFee;
    await User.findByIdAndUpdate(
      userId,
      { walletBalance: updateBalance },
      { new: true }
    );


    //Create transaction for refund
    await Transaction.create({
      userId: userId,
      amount: entryFee,
      transactionType: "refund",
      transactionStatus: "success",
      message: "Contest Entry Fee Refund",
    })

    // Return success response
    res
      .status(200)
      .json(new ApiResponse(200, null, "User contest deleted successfully"));
  }
  catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while deleting user contest with given id");
  }
});

export {
  createUserContest,
  getAllUserContests,
  getUserContestsById,
  updateUserContestsById,
  updateTeam,
  deleteUserContestsById
};
