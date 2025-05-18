import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Opponent } from "../models/opponent.model.js";
import mongoose, { Mongoose } from "mongoose";
import { UserContest } from "../models/userContest.model.js";

const createOpponent = asyncHandler(async (req, res) => {
  const { contestId, userContestId } = req.body;

  try {
    let opponent = await Opponent.findOne({ contestId });
    let userContest = await UserContest.findOne({ _id: userContestId });
    // console.log("++++ ", userContest.userId);
    if (opponent) {
      let added = false;
      const userId = userContest.userId;

      for (let pair of opponent.opponents) {
        if (pair.length < 2) {
          const opponentContest = await UserContest.findOne({
            _id: pair[0].toString(),
          });
          // console.log("++++++", opponentContest);
          const opponentUserId = opponentContest.userId;

          if (userId.toString() != opponentUserId.toString()) {
            pair.push(userContestId);
            added = true;
            break;
          }
        }
      }

      if (!added) {
        opponent.opponents.push([userContestId]);
      }

      const updatedOpponent = await opponent.save();
      res
        .status(200)
        .json(
          new ApiResponse(200, updatedOpponent, "Opponent updated successfully")
        );
    } else {
      opponent = new Opponent({
        contestId,
        opponents: [[userContestId]],
      });

      const savedOpponent = await opponent.save();
      res
        .status(201)
        .json(
          new ApiResponse(201, savedOpponent, "Opponent created successfully")
        );
    }
  } catch (error) {
    console.log("Error while creating/updating Opponent: ", error);
    throw new ApiError(400, "Error while creating/updating Opponent");
  }
});
const getOpponent = asyncHandler(async (req, res) => {
  const { contestId, userContestId } = req.body;
  //   console.log("In get opponent: ", req.body);

  try {
    const opponent = await Opponent.aggregate([
      {
        $match: {
          contestId: new mongoose.Types.ObjectId(contestId),
        },
      },
      {
        $unwind: "$opponents",
      },
      {
        $match: {
          opponents: new mongoose.Types.ObjectId(userContestId),
        },
      },
      {
        $project: {
          opponent: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$opponents",
                  as: "opponent",
                  cond: {
                    $ne: [
                      "$$opponent",
                      new mongoose.Types.ObjectId(userContestId),
                    ],
                  },
                },
              },
              0,
            ],
          },
          contestId: 1,
        },
      },
    ]);
    // console.log("Opponent: ", opponent);

    if (!opponent[0].opponent) {
      return res
        .status(404)
        .json({ message: "No opponent found for this user id." });
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, opponent[0], "user opponent fetched successfully")
      );
  } catch (error) {
    console.log("error: ", error);
    throw new ApiError(500, "Error while fetching user opponent");
  }
});

export { createOpponent, getOpponent };
