import express from "express";
import userController from "./user.controller.js";
import { jwtAuth } from "../../config/JWTauth.js";

const userRouter = express.Router();
const controller = new userController();

userRouter.post("/signup", (req, res) => controller.signup(req, res));
userRouter.post("/signin", (req, res) => controller.signIn(req, res));
userRouter.post("/profile-details", jwtAuth, (req, res) =>
  controller.profile(req, res)
);
userRouter.get("/profile-details/me", jwtAuth, (req, res) =>
  controller.userProfile(req, res)
);

userRouter.post("/forgot-pass", (req, res, next) => {
  controller.handleOTP(req, res, next);
});
userRouter.post("/change-pass", (req, res, next) => {
  controller.changePass(req, res, next);
});
export default userRouter;
