import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as userRepository from "../data/user.js";
import { config } from "../config.js";
// import { v4 } from 'uuid';

export async function me(req, res) {
  const user = await userRepository.getById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
  }
  res.status(200).json(user);
}

export async function update(req, res) {
  const id = req.params.id;
  const { username, url, introduce, alert, tag } = req.body;
  const user = await userRepository.update(
    id,
    username,
    url,
    introduce,
    alert,
    tag
  );
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: `수정에 실패했습니다` });
  }
}

export async function addList(req, res) {
  const { column, id } = req.body;
  const data = await userRepository.addList(req.userId, column, parseInt(id));
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `요청 반영 실패` });
  }
}

export async function removeList(req, res) {
  const { column, id } = req.body;
  const data = await userRepository.removeList(
    req.userId,
    column,
    parseInt(id)
  );
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `요청 반영 실패` });
  }
}

export async function remove(req, res) {
  const id = req.params.id;
  await userRepository.remove(id);
  res.sendStatus(204);
}

export async function signup(req, res) {
  const { name, username, password, email, url } = req.body;
  // 사용자가 기존에 이미 있는지 없는지 확인
  const foundUsername = await userRepository.getByUsername(username);
  const foundEmail = await userRepository.getByEmail(email);
  // 이미 있는 username이면 return
  if (foundUsername) {
    return res
      .status(409)
      .json({ message: `${username}은(는) 이미 존재하는 아이디입니다.` });
  }
  if (foundEmail) {
    return res
      .status(409)
      .json({ message: `${email}은 이미 회원가입된 이메일입니다` });
  }
  // 비밀번호 hashing해서 보안처리
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  // user 생성
  const userId = await userRepository.signUp({
    name,
    username,
    password: hashed,
    email,
    url,
  });
  res.status(201).json({ username });
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await userRepository.getByUsername(username);
  if (!user) {
    return res
      .status(401)
      .json({ message: "잘못된 사용자 또는 비밀번호입니다" });
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res
      .status(401)
      .json({ message: "잘못된 사용자 또는 비밀번호입니다" });
  }
  const id = user.id;
  const accessToken = createAccessJwtToken(id);
  const refreshToken = createRefreshJwtToken(id);
  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);
  res.status(201).json({ id });
}

export async function logout(req, res) {
  res.cookie("accessToken", "");
  res.cookie("refreshToken", "");
  res.status(200).json({ message: "로그아웃됐습니다" });
}

export async function csrfToken(req, res) {
  const csrfToken = await generateCSRFToken();
  res.status(200).json({ csrfToken });
}

export function createAccessJwtToken(id) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSecAccess,
  });
}

export async function updatePw(req, res) {
  const { id, password } = req.body;
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const response = await userRepository.updatePw(id, hashed);
  if (response) {
    res.status(200).json(response);
  } else {
    res.status(401).json({ message: "비밀번호 변경에 실패했습니다" });
  }
}

export async function findPw(req, res) {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const response = await userRepository.findPw(email, hashed);
  if (response) {
    res.status(200).json(response);
  } else {
    res.status(401).json({ message: "비밀번호 변경에 실패했습니다" });
  }
}

export async function checkPw(req, res) {
  const { id, pw } = req.body;
  const user = await userRepository.getById(id);

  try {
    const isValidPassword = await bcrypt.compare(pw, user.password);
    if (isValidPassword) {
      return res.status(200).json(isValidPassword);
    } else {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
    }
  } catch (err) {
    return res.response.data.message;
  }
}

export async function getPostByBookmark(req, res) {
  const username = req.params.username;
  const data = await userRepository.getPostByBookmark(username);
  res.status(200).json(data);
}

function createRefreshJwtToken(id) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSecRefresh,
  });
}

const options = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
};
export function setAccessToken(res, accessToken) {
  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: config.jwt.expiresInSecAccess * 1000,
  });
}

function setRefreshToken(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: config.jwt.expiresInSecRefresh * 1000,
  });
}

function generateCSRFToken() {
  return bcrypt.hash(config.csrf.plainToken, 1);
}
