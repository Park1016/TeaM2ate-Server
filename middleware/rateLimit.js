import rateLimit from "express-rate-limit";

export const sendEmaillimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 3,
  delayMs: 1000,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "3분에 3번만 요청가능합니다.",
    });
  },
});

export const authNumlimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 50,
  delayMs: 1000,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "3분에 50번만 요청가능합니다.",
    });
  },
});
