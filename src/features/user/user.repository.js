import { comparePassword } from "../../utils/comparepassword.js";
import otpModel from "./otp.schema.js";
import userModel from "./user.schema.js";
import crypto from "crypto";

export default class userRepository {
  //signup for user details
  async signUp(data) {
    try {
      const exsistingUser = await userModel.findOne({ email: data.email });
      if (exsistingUser) {
        throw new Error("User with this email already exists");
      }
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      delete data.confirmPassword;
      const user = new userModel(data);

      await user.save();

      return user;
    } catch (error) {
      console.error("SignUp Error:", error.message);
      throw error;
    }
  }

  //user signIn
  async SignIn(data) {
    try {
      const existingUser = await userModel.findOne({ email: data.email });
      if (!existingUser) {
        throw new Error("User not found");
      }
      let validation = await comparePassword(
        data.password,
        existingUser.password
      );
      if (!validation) {
        throw new Error("Wrong Password");
      }
      return existingUser;
    } catch (error) {
      console.error("Signin Error:", error.message);
      throw error;
    }
  }

  async updateProfile(userId, updates) {
    try {
      const user = await userModel.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
  async userProfile(userId) {
    try {
      const user = await userModel.findById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async handleOTP(email, otp = null) {
    if (!otp) {
      const newOtp = crypto.randomInt(100000, 999999).toString();
      const result = new otpModel({ email, otp: newOtp });
      await result.save();
      return { type: "store", otp: newOtp };
    } else {
      const otpRecord = await otpModel
        .findOne({ email })
        .sort({ createdAt: -1 });
      if (!otpRecord) {
        throw new ApplicationError("OTP not found or expired", 400);
      }
      if (otpRecord.otp !== otp) {
        throw new ApplicationError("Invalid OTP", 400);
      }
      await otpModel.deleteOne({ _id: otpRecord._id });
      return {
        type: "verify",
        success: true,
        message: "OTP verified successfully",
      };
    }
  }
  async changePass(email, hashedPassword) {
    return await userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
  }
}
