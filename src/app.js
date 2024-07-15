import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


dotenv.config({path: "./.env"});

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public/temp'));
app.use(cookieParser());


// routes
import healthcheckRouter from './routes/healthcheck.route.js';
import userRouter from './routes/user.route.js';

app.use('/api/v1', healthcheckRouter)
app.use('/api/v1/user', userRouter);


export default app;