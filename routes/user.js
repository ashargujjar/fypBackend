import express from "express";
import {
  login,
  signup,
  SendOtp,
  verifyOtp,
  resetPassword,
} from "../controllers/user.js";
import { verifyOtpToken } from "../middleware/auth.js";
const user = express.Router();
user.post("/signup", signup);
user.post("/login", login);
user.post("/sendOtp", SendOtp);
user.post("/verifyOtp", verifyOtp);
user.post("/resetPassword", verifyOtpToken, resetPassword);
export default user;
