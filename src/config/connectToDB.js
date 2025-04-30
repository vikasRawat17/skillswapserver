import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to DATABASE successfully");
  } catch (error) {
    console.error("Error connecting to DATABASE:", error.message);
    process.exit(1);
  }
};

export default connectToDB;
