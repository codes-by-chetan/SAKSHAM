import mongoose from "mongoose";
import config from "../config/env.config.js";
import logger from "../config/logger.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.logMessage("success", "MongoDB connected successfully");
  } catch (error) {
    logger.logMessage("error", "MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
