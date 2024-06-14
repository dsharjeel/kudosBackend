import dotenv from "dotenv";
import connectDB from "./db/dbconfig.js";

dotenv.config({ path: "./.env" });
connectDB();
