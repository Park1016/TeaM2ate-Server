import express from "express";
import "express-async-errors";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.js";
import { isAuth } from "../middleware/auth.js";
import * as commentController from "../controller/comment.js";

const router = express.Router();

//Get /comment/:postId
//Get /comment?username=:username
//Post /comment/write
//Put /comment/update/:id
//Delete /comment/delete/:id

router.get(
  "/",
  [
    isAuth,
    query("username").notEmpty().withMessage("닉네임을 입력하세요"),
    validate,
  ],
  commentController.getByUsername
);

router.get("/post/:username", [isAuth], commentController.getPostByComment);

router.get(
  "/:postId",
  [
    param("postId")
      .trim()
      .isLength({ min: 1 })
      .withMessage("게시판 아이디를 입력해주세요"),
    validate,
  ],
  commentController.getByPostId
);

router.post(
  "/write",
  [
    isAuth,
    body("postId").notEmpty().withMessage("게시글 아이디를 입력해주세요"),
    body("text").notEmpty().withMessage("게시글을 작성해주세요"),
    body("url")
      .isURL()
      .withMessage("URL형식에 맞게 입력해주세요")
      .optional({ nullable: true, checkFalsy: true }),
    validate,
  ],
  commentController.write
);

router.put(
  "/update/:id",
  [
    isAuth,
    param("id").isLength({ min: 1 }).withMessage("댓글 아이디를 입력해주세요"),
    body("text").notEmpty().withMessage("댓글을 작성해주세요"),
    validate,
  ],
  commentController.update
);

router.delete(
  "/delete/:id",
  [
    isAuth,
    param("id").isLength({ min: 1 }).withMessage("댓글 아이디를 입력해주세요"),
    validate,
  ],
  commentController.remove
);

export default router;
