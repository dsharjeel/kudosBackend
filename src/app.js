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
app.use(cookieParser)


// routes
import healthcheckRouter from './routes/healthcheck.route.js';

app.use('/api/v1/healthcheck', healthcheckRouter)

app.use('api/v1/user')

export default app;