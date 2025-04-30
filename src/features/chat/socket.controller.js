// sockets/socketHandler.js

import ChatRepository from "./chat.repository.js";

const repo = new ChatRepository();
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send-message", async ({ chatId, message }) => {
      try {
        const savedMessage = await repo.saveMessageToChat(chatId, {
          sender: message.sender,
          content: message.content,
          timestamp: new Date(),
        });

        io.to(chatId).emit("receive-message", savedMessage);
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    socket.on("disconnect", () => {});
  });
}
