import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
import playerRouter from "./routes/player.routes.js";
import teamRouter from "./routes/team.routes.js";
import userContestRouter from "./routes/userContest.routes.js";
import OpponentRouter from "./routes/opponent.routes.js";
import TransactionRouter from "./routes/transaction.routes.js";
import payment from "./routes/payment.routes.js";
import adminRouter from "./routes/admin.routes.js";
import emailRouter from "./routes/email.routes.js";
import withdrawMoneyRouter from "./routes/withdrawMoney.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/contests", contestRouter);
app.use("/api/v1/match", matchRouter);
app.use("/api/v1/player", playerRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/user-contest", userContestRouter);
app.use("/api/v1/opponent", OpponentRouter);
app.use("/api/v1/transactions", TransactionRouter);
app.use('/api/v1/payment', payment)
app.use('/api/v1/withdraw', withdrawMoneyRouter)
app.use('/api/v1/email', emailRouter)

app.get("/", (req, res) => {
  res.send("<h1>Backend server is running</h1>");
});

export { app };
