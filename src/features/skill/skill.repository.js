import skillModel from "./skill.schema.js";
import mongoose from "mongoose";

export default class SkillRepository {
  async createSkill(data) {
    try {
      if (!data) {
        throw new Error("provide skill details");
      }

      const existingSkill = await skillModel.findOne({
        userId: data.userId,
        skillName: data.skillName,
        type: data.type,
      });

      if (existingSkill) {
        existingSkill.description = data.description;
        return await existingSkill.save();
      }

      const skill = new skillModel(data);
      return await skill.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          `You already have a ${data.type} entry for ${data.skillName}`
        );
      }
      throw error;
    }
  }

  async getAllSkills(type) {
    if (type) {
      return await skillModel.find({ type }).populate("userId", "name email");
    }
    return await skillModel.find().populate("userId", "name email");
  }

  async getSkillsFiltered(filters) {
    const query = {};

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.skillName) {
      query.skillName = new RegExp(filters.skillName, "i");
    }

    return await skillModel.find(query).populate("userId", "name email");
  }

  async matchSkills(skillName) {
    const seekers = await skillModel
      .find({
        skillName: new RegExp(skillName, "i"),
        type: "seek",
      })
      .populate("userId", "name email");

    const offerers = await skillModel
      .find({
        skillName: new RegExp(skillName, "i"),
        type: "offer",
      })
      .populate("userId", "name email");

    return { seekers, offerers };
  }

  async matchMutualSkills(userId) {
    const userSeeks = await skillModel.find({ userId, type: "seek" });
    const seekNames = userSeeks.map((seek) => seek.skillName.toLowerCase());

    const usersOfferingWhatISeek = await skillModel
      .find({
        type: "offer",
        userId: { $ne: userId },
      })
      .populate("userId", "name email");

    const matchingOffers = usersOfferingWhatISeek.filter((offer) =>
      seekNames.includes(offer.skillName.toLowerCase())
    );

    const userOffers = await skillModel.find({ userId, type: "offer" });
    const offerNames = userOffers.map((offer) => offer.skillName.toLowerCase());

    const usersSeekingWhatIOffer = await skillModel
      .find({
        type: "seek",
        userId: { $ne: userId },
      })
      .populate("userId", "name email");

    const matchingSeekers = usersSeekingWhatIOffer.filter((seek) =>
      offerNames.includes(seek.skillName.toLowerCase())
    );

    const offeringMatches = matchingOffers.map((match) => ({
      user: match.userId,
      matchType: "they_offer",
      skill: match.skillName,
    }));

    const seekingMatches = matchingSeekers.map((match) => ({
      user: match.userId,
      matchType: "they_seek",
      skill: match.skillName,
    }));

    return [...offeringMatches, ...seekingMatches];
  }
  async getUserSkills(userId) {
    return await skillModel.find({ userId }).populate("userId", "name email");
  }
  // async getUserSkills(userId) {
  //   return await skillModel
  //     .find({ userId })
  //     .select("skillName type description")
  //     .populate("userId", "name email");
  // }

  async deleteUserSkill(skillId) {
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      throw new Error("Invalid skillId");
    }

    return await skillModel.findByIdAndDelete(skillId);
  }

  async updateUserSKill(skillId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      throw new Error("Invalid skillId");
    }
    return await skillModel.findByIdAndUpdate(skillId, updateData, {
      new: true,
    });
  }

  // SkillRepository.js
async getSkillMatchesByName(userId, skillName, type) {
  try {
    let matches = [];
    
    // If user is seeking a skill, find people offering it
    if (type === "seek") {
      matches = await skillModel.find({
        skillName: new RegExp(skillName, "i"),
        type: "offer",
        userId: { $ne: userId } // Exclude current user
      }).populate("userId", "name email");
    } 
    // If user is offering a skill, find people seeking it
    else if (type === "offer") {
      matches = await skillModel.find({
        skillName: new RegExp(skillName, "i"),
        type: "seek",
        userId: { $ne: userId } // Exclude current user
      }).populate("userId", "name email");
    }
    
    return matches;
  } catch (error) {
    throw error;
  }
}
}
