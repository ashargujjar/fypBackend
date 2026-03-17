import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { addRider } from "../controllers/admin.js";
import {
  getRider,
  getRiderTasks,
  RemoveRider,
  updateShipmentStatus,
  updateRider,
  getRiderProfile,
} from "../controllers/rider.js";

const rider = express.Router();
rider.post("/addRider", verifyUserToken, addRider); // Purpose: add a new rider; Data: JSON body with rider details
rider.get("/getRiders", verifyUserToken, getRider); // Purpose: list riders; Data: query params (optional filters)
rider.get("/getRiderTasks", verifyUserToken, getRiderTasks); // Purpose: list rider tasks; Data: query params (optional filters)
rider.put(
  "/updateShipmentStatus/:shipmentId",
  verifyUserToken,
  updateShipmentStatus,
); // Purpose: update shipment status; Data: path param shipmentId + JSON body (status)
rider.get("/profile", verifyUserToken, getRiderProfile); // Purpose: get current rider profile; Data: none (auth only)
rider.put("/editRider/:riderId", verifyUserToken, updateRider); // Purpose: update rider details; Data: path param riderId + JSON body
rider.delete("/removeRider/:riderId", verifyUserToken, RemoveRider); // Purpose: remove rider; Data: path param riderId
export default rider;
