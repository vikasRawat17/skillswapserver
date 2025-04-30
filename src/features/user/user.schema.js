import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Name should be at least three characters long"],
    },
    bio: {
      type: String,
      default: "",
    },
    ratings: {
      type: [
        {
          score: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
          },
          review: {
            type: String,
          },
          ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    location: {
      type: {
        address: {
          type: String,
          default: "",
        },
        city: {
          type: String,
          default: "",
        },
        state: {
          type: String,
          default: "",
        },
        zipCode: {
          type: String,
          default: "",
        },
        coordinates: {
          type: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
          },
          default: {},
        },
      },
      default: {},
    },
    email: {
      type: String,
      index: true,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minLength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must include uppercase, lowercase, number, and special character",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Please provide your mobile number"],
      unique: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please provide your gender"],
    },
    signedUpOn: {
      type: Date,
      default: Date.now,
    },
    availability: {
      type: [
        {
          day: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
          slots: [
            {
              startTime: String,
              endTime: String,
            },
          ],
        },
      ],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "default-profile.jpg",
    },
    jobHistory: {
      type: [
        {
          title: String,
          company: String,
          startDate: Date,
          endDate: Date,
          description: String,
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          institution: String,
          degree: String,
          field: String,
          graduationYear: Number,
        },
      ],
      default: [],
    },
    certifications: {
      type: [
        {
          name: String,
          issuedBy: String,
          issueDate: Date,
          expiryDate: Date,
          credentialURL: String,
        },
      ],
      default: [],
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted"],
      default: "active",
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((total, rating) => total + rating.score, 0);
  return (sum / this.ratings.length).toFixed(1);
});

userSchema.pre("save", async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
