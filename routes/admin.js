import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { setRates } from "../controllers/rate.js";
const admin = express.Router();

admin.put("/rates", verifyUserToken, setRates);

export default admin;
