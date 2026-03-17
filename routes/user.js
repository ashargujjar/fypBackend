import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import {
  login,
  SendOtp,
  verifyOtp,
  getWalletBalance,
  topupWallet,
  withdrawWallet,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  verifyEmail,
  sendToken,
  signup,
  StripeChecout,
} from "../controllers/user.js";
import { getZones } from "../controllers/zone.js";
import { verifyOtpToken } from "../middleware/auth.js";
const user = express.Router();
user.post("/signup", signup); // Purpose: user signup; Data: JSON body with profile/credentials
user.post("/login", login); // Purpose: user login; Data: JSON body with credentials
user.get("/verifyEmail", verifyEmail); // Purpose: verify email address; Data: query param token
user.post("/sendToken", sendToken); // Purpose: send email verification token; Data: JSON body with email

user.post("/sendOtp", SendOtp); // Purpose: send OTP; Data: JSON body with phone/email
user.post("/verifyOtp", verifyOtp); // Purpose: verify OTP; Data: JSON body with otp + identifier
user.post("/resetPassword", verifyOtpToken, resetPassword); // Purpose: reset password; Data: JSON body with new password + OTP token
user.post("/create-checkout-session", verifyUserToken, StripeChecout); // Purpose: create Stripe checkout session; Data: JSON body with amount/items
user.get("/zones", getZones); // Purpose: list service zones; Data: none
user.get("/walletBalance", verifyUserToken, getWalletBalance); // Purpose: get wallet balance; Data: none (auth only)
user.post("/wallet/topup", verifyUserToken, topupWallet); // Purpose: add wallet balance (demo/manual); Data: JSON body with amount
user.post("/wallet/withdraw", verifyUserToken, withdrawWallet); // Purpose: withdraw wallet balance (demo/manual); Data: JSON body with amount
user.get("/profile", verifyUserToken, getUserProfile); // Purpose: get user profile; Data: none (auth only)
user.put("/profile", verifyUserToken, updateUserProfile); // Purpose: update user profile; Data: JSON body with profile fields

export default user;
