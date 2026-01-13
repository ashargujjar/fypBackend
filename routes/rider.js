import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { addRider } from "../controllers/admin.js";
import { getRider } from "../controllers/rider.js";

const rider = express.Router();
rider.post("/addRider", verifyUserToken, addRider);
rider.get("/getRiders", verifyUserToken, getRider);
export default rider;
