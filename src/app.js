import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

//import routes
import userRouter from "./routes/user.routes.js";
import contestRouter from "./routes/contest.routes.js";
import matchRouter from "./routes/match.routes.js";
import userTeamRouter from "./routes/userTeam.routes.js";
import playerRouter from "./routes/player.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/contests", contestRouter);
app.use("/api/v1/match", matchRouter);
app.use("/api/v1/user-team", userTeamRouter);
app.use("/api/v1/player", playerRouter);

export { app };
