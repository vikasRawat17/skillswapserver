// routes/chatRoutes.js
import express from "express";
import ChatController from "./chat.controller.js";

const chatRouter = express.Router();
const controller = new ChatController();

chatRouter.post("/start", (req, res) => controller.startChat(req, res));
chatRouter.get("/:chatId/messages", (req, res) =>
  controller.getMessages(req, res)
);

chatRouter.post("/:chatId/message", (req, res) =>
  controller.addInitialMessage(req, res)
);

chatRouter.post("/:chatId/messages", (req, res) =>
  controller.sendMessage(req, res)
);

export default chatRouter;
