import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { createAccessJwtToken, setAccessToken } from "../controller/user.js";
import * as userRepository from "../data/user.js";

const AUTH_ERROR = { message: "Authentication Error" };

export const isAuth = async (req, res, next) => {
  let token;
  let refresh;
  const authHeader = req.get("Authorization");
  // header에 token있으면 그 token을 let token변수에 담음
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // header에 token없으면 cookie에서 token값 가져와서 담음
  if (!token) {
    token = req.cookies["accessToken"];
  }
  // cookie에 accessToken없으면 refreshToken 가져옴
  if (!token) {
    refresh = req.cookies["refreshToken"];
  }
  // refresh cookie도 없으면 에러던짐
  if (!token && refresh) {
    const { id } = jwt.decode(refresh);
    token = createAccessJwtToken(id);
    setAccessToken(res, token);
  } else if (!token && !refresh) {
    return res.status(401).json({ message: "Authentication Error 1" });
  }

  jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Authentication Error 2" });
    }
    const user = await userRepository.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Authentication Error 3" });
    }
    req.userId = user.id;
    req.username = user.username;
    req.url = user.url;
    next();
  });
};
