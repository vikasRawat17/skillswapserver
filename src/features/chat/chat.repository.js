// repository/chatRepo.js

import mongoose from "mongoose";
import chatModel from "./chat.schema.js";

export default class ChatRepository {
  async findOrCreateChat(userId1, userId2) {
    let chat = await chatModel.findOne({
      participants: { $all: [userId1, userId2] },
    });

    if (!chat) {
      chat = new chatModel({ participants: [userId1, userId2], messages: [] });
      await chat.save();
    }

    return chat;
  }

  async getChatMessages(chatId) {
    const chat = await chatModel
      .findById(chatId)
      .populate("messages.sender", "name avatar");
    return chat ? chat.messages : [];
  }

  async saveMessageToChat(chatId, message) {
    const chat = await chatModel.findById(chatId);
    if (chat) {
      const senderId =
        typeof message === "object"
          ? message.sender.id || message.sender._id
          : message.sender;

      if (!mongoose.Types.ObjectId.isValid(senderId)) {
        throw new Error("Invalid sender ID");
      }

      const normalizedMessage = {
        content: message.content,
        timestamp: message.timestamp || new Date(),
        sender: senderId,
      };

      chat.messages.push(normalizedMessage);
      await chat.save();
      return chat.messages[chat.messages.length - 1];
    }
    return null;
  }
  async findChatById(chatId) {
    return await chatModel.findById(chatId);
  }
}
