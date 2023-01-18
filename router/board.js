import express from 'express';
import 'express-async-errors';
import { param } from 'express-validator';
import { validate } from '../middleware/validation.js';
import * as boardController from '../controller/board.js';

const router = express.Router();

//Get /board
//Get /board/cate/start/amount
router.get('/', boardController.getBoard);
router.get(
    '/:cate/:start/:amount', 
    [
        param('cate').notEmpty().withMessage('게시판 유형을 입력해주세요'),
        param('start').isInt().withMessage('어디서부터 게시글을 불러올건지 숫자를 입력해주세요'),
        param('amount').isInt().withMessage('시작점부터 얼만큼 게시글을 불러올건지 숫자를 입력해주세요'),
        validate,
    ],
    boardController.getBoardByAmount
);

export default router;