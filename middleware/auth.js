import jwt from "jsonwebtoken";

export const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization header is required." });
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Authorization header must start with Bearer.",
    });
  }

  const token = match[1].trim();
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Bearer token cannot be empty." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

export const verifyOtpToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "Authorization header is required." });
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Authorization header must start with Bearer.",
    });
  }

  const token = match[1].trim();
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Bearer token cannot be empty." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.purpose !== "password_reset") {
      return res.status(403).json({
        success: false,
        message: "Token is not valid for password reset.",
      });
    }

    req.otpPayload = payload;
    return next();
  } catch (error) {
    console.error("OTP verification failed:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired reset token." });
  }
};
