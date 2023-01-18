import express from "express";
import "express-async-errors";
import multer from "multer";
import { body, param } from "express-validator";
import { isAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { sendEmaillimiter, authNumlimiter } from "../middleware/rateLimit.js";
import * as userController from "../controller/user.js";
import * as emailController from "../controller/email.js";
import * as photoController from "../controller/photo.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const validateLogin = [
  body("username").trim().notEmpty().withMessage("닉네임을 입력해주세요"),
  body("password")
    .trim()
    .isLength({ min: 2 })
    .withMessage("비밀번호를 입력해주세요"),
  validate,
];

const validateSignup = [
  body("name").notEmpty().withMessage("이름을 입력해주세요"),
  ...validateLogin,
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("이메일을 형식에 맞게 입력해주세요"),
  body("url")
    .isURL()
    .withMessage("URL형식에 맞게 입력해주세요")
    // url은 옵션으로 값이 아예없거나(nullable), 텅텅빈 문자열(checkFalsy)이어도 받아줌
    .optional({ nullable: true, checkFalsy: true }),
  validate,
];

router.get("/me", isAuth, userController.me);

router.get("/csrf-token", userController.csrfToken);

router.post("/checkPw", isAuth, userController.checkPw);

router.put("/updatePw", isAuth, userController.updatePw);

router.put("/findPw", userController.findPw);

router.post("/photo", upload.single("url"), (req, res) =>
  console.log(req.file)
);

router.put("/addList", isAuth, userController.addList);

router.put("/removeList", isAuth, userController.removeList);

router.post("/signup", validateSignup, userController.signup);

router.post("/login", validateLogin, userController.login);

router.post("/logout", userController.logout);

router.post("/email", sendEmaillimiter, emailController.sendEmail);

router.post("/checkAuthNum", authNumlimiter, emailController.checkAuthNum);

router.get("/post/:username", [isAuth], userController.getPostByBookmark);

router.put(
  "/update/:id",
  // [
  //     isAuth,
  //     param('id').isLength({ min : 2 }).withMessage('유저 고유아이디를 입력해주세요'),
  //     body('username').notEmpty().withMessage('닉네임을 입력해주세요'),
  //     body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
  //     body('email').isEmail().withMessage('이메일을 형식에 맞게 입력해주세요').normalizeEmail(),
  //     validate
  // ],
  userController.update
);

router.delete("/delete/:id", [isAuth, validate], userController.remove);

export default router;
