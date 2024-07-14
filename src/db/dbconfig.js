import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const dbconnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`${dbconnection.connection.name} successfully connected on ${dbconnection.connection.host}`);
    } catch (error) {
        console.log(`Database connection failed: ${error}`);
        process.exit(1);
    }
}

export default connectDB;