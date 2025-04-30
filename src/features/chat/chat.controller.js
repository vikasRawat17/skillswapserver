import ChatRepository from "./chat.repository.js";

export default class ChatController {
  constructor() {
    this.repository = new ChatRepository();
  }

  async startChat(req, res) {
    try {
      const { otherUserId } = req.body;
      const userId = req.user.id;

      const chat = await this.repository.findOrCreateChat(userId, otherUserId);

      res.status(200).json({
        id: chat._id,
        participants: chat.participants,
        createdAt: chat.createdAt,
        lastMessage: null,
      });
    } catch (err) {
      console.error("Error in startChat:", err);
      res.status(500).json({ error: "Could not start chat" });
    }
  }

  async addInitialMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message content is required" });
      }

      const message = {
        sender: userId,
        content,
        timestamp: new Date(),
      };

      const savedMessage = await this.repository.saveMessageToChat(
        chatId,
        message
      );
      res.status(201).json({
        ...savedMessage.toObject(),
        sender: {
          id: userId, // Always use the direct ID
          name: req.user.name, // Optional
        },
      });
    } catch (err) {
      console.error("Error in addInitialMessage:", err);
      res.status(500).json({ error: "Failed to add initial message" });
    }
  }

  async getMessages(req, res) {
    try {
      const chatId = req.params.chatId;

      // Check if user is a participant in this chat (security measure)
      const chat = await this.repository.findChatById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (!chat.participants.includes(req.user.id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await this.repository.getChatMessages(chatId);
      const formattedMessages = messages.map((msg) => ({
        ...msg.toObject(),
        content: msg.content,
        timestamp: msg.timestamp,
        sender: {
          id: msg.sender?._id || msg.sender,
          name: msg.sender?.name || null,
        },
      }));
      res.status(200).json(formattedMessages);
    } catch (err) {
      console.error("Error in getMessages:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch messages", details: err.message });
    }
  }

  async sendMessage(req, res) {
    try {
      console.log("here");

      const { chatId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      console.log(chatId, content, userId);

      // Check if user is a participant in this chat
      const chat = await this.repository.findChatById(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (!chat.participants.includes(userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const message = {
        sender: userId,
        content,
        timestamp: new Date(),
      };

      const savedMessage = await this.repository.saveMessageToChat(
        chatId,
        message
      );
      console.log(savedMessage);

      res.status(201).json({
        ...savedMessage.toObject(),
        sender: {
          id: userId, // Always use the direct ID
          name: req.user.name, // Optional
        },
      });
    } catch (err) {
      console.error("Error in sendMessage:", err);
      res
        .status(500)
        .json({ error: "Failed to send message", details: err.message });
    }
  }
}
