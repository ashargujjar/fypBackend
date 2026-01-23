import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { setRates } from "../controllers/rate.js";
import { signup } from "../controllers/user.js";
import { assignRider, getShipments } from "../controllers/admin.js";
const admin = express.Router();

admin.post("/signup", signup);
admin.post("/assignRider", verifyUserToken, assignRider);
admin.get("/allShipments", verifyUserToken, getShipments);
admin.put("/rates", verifyUserToken, setRates);

export default admin;
