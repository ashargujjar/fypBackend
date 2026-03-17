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
import { attachIotDevice, detachIotDevice } from "../controllers/iot.js";

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
rider.post("/iot/attach", verifyUserToken, attachIotDevice); // Purpose: attach IoT device to shipment; Data: JSON body with shipmentId + deviceId
rider.post("/iot/detach", verifyUserToken, detachIotDevice); // Purpose: detach IoT device from shipment; Data: JSON body with shipmentId + deviceId
export default rider;
