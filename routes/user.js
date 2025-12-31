import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import {
  login,
  signup,
  SendOtp,
  verifyOtp,
  getWalletBalance,
  resetPassword,
} from "../controllers/user.js";
import { getZones } from "../controllers/zone.js";
import { verifyOtpToken } from "../middleware/auth.js";
const user = express.Router();
user.post("/signup", signup);
user.post("/login", login);
user.post("/sendOtp", SendOtp);
user.post("/verifyOtp", verifyOtp);
user.post("/resetPassword", verifyOtpToken, resetPassword);
user.get("/zones", getZones);
user.get("/walletBalance", verifyUserToken, getWalletBalance);
export default user;
