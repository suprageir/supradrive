import cookieParser from 'cookie-parser';
//import morgan from 'morgan';
//import helmet from 'helmet';
import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';

const app = express();
const { BAD_REQUEST } = StatusCodes;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const cors = require('cors');

const corsConfig = {
    origin: ["https://sd.suprageir.no", "https://localhost"],
    credentials: true,
    exposedHeaders:["Authorization"],
};
app.use(cors(corsConfig));

//app.use(cors({
//    origin: '*'
//}));

// Show routes called in console during development
//if (process.env.NODE_ENV === 'development') {
//    app.use(morgan('dev'));
//}

// Security
//if (process.env.NODE_ENV === 'production') {
//    app.use(helmet());
//}

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/api', BaseRouter);    
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});

export default app;
