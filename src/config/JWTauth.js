import jwt from "jsonwebtoken";
import userModel from "../features/user/user.schema.js";

export const jwtAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(403).json({ msg: "Access denied. No token provided." });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(payload._id).select("_id,name,email");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    req.user = user;
    req.userID = user._id;
    req.email = user.email;
    next();
  } catch (error) {
    throw new Error("jwt error");
    console.log(error);
  }
};
