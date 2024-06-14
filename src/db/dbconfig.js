import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Connected to the ${DB_NAME} database at ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error connecting to the database: ", error.message); // remove .message to see the full error object
    process.exit(1);
  }
};

export default connectDB;