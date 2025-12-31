import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { bookShipment } from "../controllers/shipment.js";
const shipment = express.Router();
shipment.post("/bookShipment", verifyUserToken, bookShipment);

export default shipment;
