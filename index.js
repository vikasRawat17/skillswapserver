import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./src/features/user/user.routes.js";
import { jwtAuth } from "./src/config/JWTauth.js";
import skillRouter from "./src/features/skill/skill.routes.js";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./src/features/chat/socket.controller.js";
import chatRouter from "./src/features/chat/chat.routes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

dotenv.config();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use(
  "/uploads/profiles",
  express.static(path.join(process.cwd(), "src/uploads/profiles"))
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/users", limiter, userRouter);
app.use("/api/skills", jwtAuth, limiter, skillRouter);
socketHandler(io);
app.use("/api/chats", jwtAuth, chatRouter);

export default app;
export { server };
