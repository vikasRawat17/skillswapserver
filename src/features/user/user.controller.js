import jwt from "jsonwebtoken";
import userRepository from "./user.repository.js";
import multer from "multer";
import { sendEmail } from "../../utils/email.js";
import { sendOTPEmail } from "../../utils/otp.js";
import bcrypt from "bcrypt";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
}).single("profileImage");

export default class userController {
  constructor() {
    this.repository = new userRepository();
  }

  async signup(req, res) {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ msg: "Please provide details" });
    }
    try {
      const user = await this.repository.signUp(data);
      await sendEmail(data);
      res.status(201).json({
        user: user.name,
        msg: "SignUp sucessful, Login to continue",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error signing up", error: error.message });
    }
  }

  async signIn(req, res) {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ msg: "Please provide login credentials" });
    }
    try {
      const user = await this.repository.SignIn(data);
      if (!user) {
        return res.status(401).json({ msg: "Invalid email or password" });
      }

      const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res
        .cookie("jwtToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 1000,
        })
        .json({
          sucess: true,
          msg: "Login Sucessful",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error logging in", error: error.message });
    }
  }

  async profile(req, res) {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ msg: err.message });
      }

      const userId = req.userID;
      const updates = req.body;

      if (!updates && !req.file) {
        return res.status(400).json({ msg: "No data provided" });
      }

      try {
        if (req.file) {
          updates.profileImage = `/uploads/profiles/${req.file.filename}`;
        } else if (
          updates.profileImage === undefined ||
          updates.profileImage === null ||
          (typeof updates.profileImage === "object" &&
            Object.keys(updates.profileImage).length === 0)
        ) {
          updates.profileImage = "/uploads/profiles/default-image.jpg";
        } else if (typeof updates.profileImage !== "string") {
          updates.profileImage = "/uploads/profiles/default-image.jpg";
        }

        const updatedUser = await this.repository.updateProfile(
          userId,
          updates
        );
        res.status(200).json({
          user: updatedUser.name,
          msg: "Profile details updated successfully",
        });
      } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ msg: "Internal server error" });
      }
    });
  }

  async userProfile(req, res) {
    const userId = req.userID;
    try {
      const updatedUser = await this.repository.userProfile(userId);
      res.status(200).json({
        user: updatedUser,
        msg: "user fetched sucessfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }

  async handleOTP(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email) {
        throw new ApplicationError("Email is required", 400);
      }
      const result = await this.repository.handleOTP(email, otp);
      if (result.type === "store") {
        await sendOTPEmail(email, result.otp);
        res.status(200).json({ message: "OTP sent to your email" });
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  }
  async changePass(req, res, next) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        throw new ApplicationError("Email and new password are required", 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.repository.changePass(email, hashedPassword);

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }
}
