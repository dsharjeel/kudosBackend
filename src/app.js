import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { JSON_LIMIT } from "./constants.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";

// Routes declaration
app.use("/users", userRouter);

export default app;
