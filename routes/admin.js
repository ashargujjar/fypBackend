import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { setRates } from "../controllers/rate.js";
import { signup } from "../controllers/user.js";
const admin = express.Router();

admin.put("/rates", verifyUserToken, setRates);
admin.post("/signup", signup);
export default admin;
