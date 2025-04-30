import skillRepository from "./skill.repository.js";

export default class SkillController {
  constructor() {
    this.repository = new skillRepository();
  }

  async postSkill(req, res) {
    try {
      const { skillName, type, description } = req.body;
      const userId = req.user.id;

      const skill = await this.repository.createSkill({
        userId,
        skillName,
        type,
        description,
      });

      res.status(201).json({ success: true, skill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllSkills(req, res) {
    try {
      const type = req.query.type;

      const skills = await this.repository.getAllSkills(type);
      res.status(200).json({ success: true, skills });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async search(req, res) {
    try {
      const { type, skillName } = req.query;
      const skills = await this.repository.getSkillsFiltered({
        type,
        skillName,
      });
      res.status(200).json({ success: true, skills });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async matchSkillUser(req, res) {
    try {
      const { skillName } = req.query;

      if (!skillName) {
        return res
          .status(400)
          .json({ success: false, message: "Skill name is required" });
      }

      const { seekers, offerers } = await this.repository.matchSkills(
        skillName
      );

      res.status(200).json({
        success: true,
        skill: skillName,
        seekers,
        offerers,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async matchForUser(req, res) {
    try {
      const userId = req.user.id;
      const matches = await this.repository.matchMutualSkills(userId);

      res.status(200).json({
        success: true,
        matches,
        matchCount: matches.length,
      });
    } catch (err) {
      console.error("Error finding matches:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async getUserSeekOrOffer(req, res) {
    try {
      const userId = req.user.id;

      const result = await this.repository.getUserSkills(userId);
      res.status(200).json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
  async deleteUSerSkill(req, res) {
    const { skillId } = req.params;

    try {
      await this.repository.deleteUserSkill(skillId);
      res.status(200).json({ success: true, msg: "Deleted succesfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async updateSkill(req, res) {
    const { skillId } = req.params;
    const updateData = req.body;

    try {
      const updatedSkill = await this.repository.updateUserSKill(
        skillId,
        updateData
      );

      if (!updatedSkill) {
        return res
          .status(404)
          .json({ success: false, message: "Skill not found" });
      }

      res.status(200).json({
        success: true,
        msg: "Updated successfully",
        skill: updatedSkill,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // skillController.js
  // skillController.js
  async getSkillMatchesByName(req, res) {
    try {
      const { skillName, type } = req.query;
      const userId = req.user.id;

      if (!skillName) {
        return res.status(400).json({
          success: false,
          message: "Skill name is required",
        });
      }

      if (!type || (type !== "seek" && type !== "offer")) {
        return res.status(400).json({
          success: false,
          message: "Valid type (seek or offer) is required",
        });
      }

      const matches = await this.repository.getSkillMatchesByName(
        userId,
        skillName,
        type
      );

      return res.status(200).json({
        success: true,
        skillName,
        type,
        matches,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
