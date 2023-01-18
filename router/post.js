import express from "express";
import "express-async-errors";
import multer from "multer";
import { body, param, query } from "express-validator";
import { validate } from "../middleware/validation.js";
import { isAuth } from "../middleware/auth.js";
import * as postController from "../controller/post.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get(
  "/",
  [
    isAuth,
    query("username").notEmpty().withMessage("닉네임을 입력해주세요"),
    validate,
  ],
  postController.getByUsername
);

router.get(
  "/:id",
  [
    param("id")
      .isLength({ min: 1 })
      .withMessage("게시글 아이디를 입력해주세요"),
    validate,
  ],
  postController.getById
);

router.post("/photo", upload.single("blob"), (req, res) => {
  console.log("------------", req);
});

router.post(
  "/write",
  [
    isAuth,
    body("title").notEmpty().withMessage("제목을 작성해주세요"),
    body("text").notEmpty().withMessage("게시글을 작성해주세요"),
    body("cate").notEmpty().withMessage("게시판 유형을 입력해주세요"),
    validate,
  ],
  postController.write
);

router.put("/addList/:id", [isAuth], postController.addList);

router.put(
  "/update/:id",
  [
    isAuth,
    param("id")
      .isLength({ min: 1 })
      .withMessage("게시글 아이디를 입력해주세요"),
    body("text").notEmpty().withMessage("게시글을 작성해주세요"),
    validate,
  ],
  postController.update
);

router.delete(
  "/delete/:id",
  [
    isAuth,
    param("id")
      .isLength({ min: 1 })
      .withMessage("게시글 아이디를 입력해주세요"),
    validate,
  ],
  postController.remove
);

export default router;
