import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import {
  login,
  SendOtp,
  verifyOtp,
  getWalletBalance,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  verifyEmail,
  sendToken,
  signup,
} from "../controllers/user.js";
import { getZones } from "../controllers/zone.js";
import { verifyOtpToken } from "../middleware/auth.js";
const user = express.Router();
user.post("/signup", signup);
user.post("/login", login);
user.get("/verifyEmail", verifyEmail);
user.post("/sendToken", sendToken);

user.post("/sendOtp", SendOtp);
user.post("/verifyOtp", verifyOtp);
user.post("/resetPassword", verifyOtpToken, resetPassword);
user.get("/zones", getZones);
user.get("/walletBalance", verifyUserToken, getWalletBalance);
user.get("/profile", verifyUserToken, getUserProfile);
user.put("/profile", verifyUserToken, updateUserProfile);
export default user;
