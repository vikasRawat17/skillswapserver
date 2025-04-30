import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["offer", "seek"],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

skillSchema.index({ userId: 1, skillName: 1, type: 1 }, { unique: true });
const skillModel = mongoose.model("Skill", skillSchema);
export default skillModel;
