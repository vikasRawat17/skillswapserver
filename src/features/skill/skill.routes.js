import express from "express";
import SkillController from "./skill.controller.js";

const skillRouter = express.Router();
const controller = new SkillController();

skillRouter.post("/", (req, res) => controller.postSkill(req, res));

skillRouter.get("/", (req, res) => controller.getAllSkills(req, res));

skillRouter.get("/search", (req, res) => controller.search(req, res));

skillRouter.get("/match", (req, res) => controller.matchSkillUser(req, res));
skillRouter.delete("/:skillId", (req, res) =>
  controller.deleteUSerSkill(req, res)
);
skillRouter.put("/:skillId", (req, res) => controller.updateSkill(req, res));

skillRouter.get("/mutual-matches", (req, res) =>
  controller.matchForUser(req, res)
);

skillRouter.get("/all", (req, res) => controller.getUserSeekOrOffer(req, res));

skillRouter.get("/matches", (req, res) =>
  controller.getSkillMatchesByName(req, res)
);

export default skillRouter;
