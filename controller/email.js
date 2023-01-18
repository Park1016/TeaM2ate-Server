import * as nodeMailer from "nodemailer";
import bcrypt from "bcrypt";
import { config } from "../config.js";
import * as emailRepository from "../data/email.js";
import * as userRepository from "../data/user.js";

export async function sendEmail(req, res) {
  const { email, checkDup } = req.body;

  const user = await userRepository.getByEmail(email);
  if (user && JSON.parse(checkDup)) {
    res.status(409).json({ message: "이미 회원가입된 이메일입니다." });
    return;
  }

  const authNum = Math.random().toString(36).substring(2, 11);
  const hashed = await bcrypt.hash(authNum, config.bcrypt.saltRounds);

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "가입 인증 메일",
    html: `
      <h2>Devs_space 회원가입 인증절차</h2>
      <p>회원가입을 위해 이메일 인증절차가 필요합니다.</p><br/>
      <p>아래의 인증번호를 이메일 인증번호 입력란에 입력해주시기 바랍니다</p><br/>
      <p>인증번호는 발송된 시점부터 3분간 유효합니다.</p><br/><br/>
      <p>인증번호는 <em>${authNum}</em> 입니다</p>
      `,
  };
  const response = await transporter.sendMail(mailOptions);
  if (response.accepted.length > 0) {
    const checkEmail = await emailRepository.getByEmail(email);
    const data = checkEmail
      ? await emailRepository.update(email, hashed)
      : await emailRepository.create(email, hashed);
    if (data) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: "이메일 인증번호 요청 실패" });
    }
  }
}

export async function checkAuthNum(req, res) {
  const { email, authNum } = req.body;
  const response = await emailRepository.getByEmail(email);
  const checkValidTime = await emailRepository.checkValidTime(
    response.validTime
  );
  if (
    parseInt(checkValidTime.split(":")[1]) >= 3 ||
    parseInt(checkValidTime.split(":")[0]) > 0
  ) {
    res.status(408).json({
      message: "인증번호의 유효기간이 지났습니다. 다시 인증요청해주세요.",
    });
    return;
  }
  if (response) {
    const isValidPassword = await bcrypt.compare(authNum, response.authNum);
    if (isValidPassword) {
      res.status(200).json(response.data);
    } else {
      res.status(401).json({ message: "인증번호가 일치하지 않습니다" });
    }
  } else {
    res.status(401).json({ message: "이메일 인증번호 요청 실패" });
  }
}
