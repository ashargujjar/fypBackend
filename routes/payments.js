import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { getUserPayments } from "../controllers/payments.js";
const payments = express.Router();

payments.get("/userPayments", verifyUserToken, getUserPayments); // Purpose: list current user's payments; Data: query params (optional filters)

export default payments;
