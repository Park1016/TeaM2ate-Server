import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import multer from 'multer';
import 'express-async-errors';

import boardRouter from './router/board.js';
import postRouter from './router/post.js';
import commentRouter from './router/comment.js';
import userRouter from './router/user.js';
import { config } from './config.js';
import { db } from './db/database.js';
import { csrfCheck } from './middleware/csrf.js';


const app = express();
const upload = multer();

const corsOption = {
    origin: config.cors.allowedOrigin,
    optionsSuccessStatus: 200,
    credentials: true
};

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsOption));
app.use(morgan('tiny'));
app.use(upload.array());

app.use(csrfCheck);
app.use('/board', boardRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);
app.use('/user', userRouter);

// 지원하지 않는 api
app.use((req, res, next) => {
    res.sendStatus(404);
});

// 에러처리
app.use((error, req, res, next) => {
    console.error(error);
    res.sendStatus(500);
})

// db.getConnection().then((connection)=>console.log(connection));
app.listen(config.host.port);