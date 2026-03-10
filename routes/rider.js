import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { addRider } from "../controllers/admin.js";
import {
  getRider,
  getRiderTasks,
  RemoveRider,
  updateRider,
  getRiderProfile,
} from "../controllers/rider.js";

const rider = express.Router();
rider.post("/addRider", verifyUserToken, addRider);
rider.get("/getRiders", verifyUserToken, getRider);
rider.get("/getRiderTasks", verifyUserToken, getRiderTasks);
rider.get("/profile", verifyUserToken, getRiderProfile);
rider.put("/editRider/:riderId", verifyUserToken, updateRider);
rider.delete("/removeRider/:riderId", verifyUserToken, RemoveRider);
export default rider;
