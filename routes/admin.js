import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { setRates } from "../controllers/rate.js";
import { signup } from "../controllers/user.js";
import {
  AdminInfoverviews,
  assignRider,
  getShipments,
} from "../controllers/admin.js";
import {
  registerIotDevice,
  listIotDevices,
  disableIotDevice,
} from "../controllers/iot.js";
const admin = express.Router();

admin.post("/signup", signup); // Purpose: admin signup; Data: JSON body with profile/credentials
admin.post("/assignRider", verifyUserToken, assignRider); // Purpose: assign rider to shipment; Data: JSON body with shipmentId + riderId
admin.get("/allShipments", verifyUserToken, getShipments); // Purpose: list all shipments; Data: query params (optional filters)
admin.get("/countDashboard", verifyUserToken, AdminInfoverviews); // Purpose: dashboard overview counts; Data: none (auth only)
admin.put("/rates", verifyUserToken, setRates); // Purpose: update delivery rates; Data: JSON body with rate config
admin.post("/iot/register", verifyUserToken, registerIotDevice); // Purpose: register new IoT device; Data: JSON body with device details
admin.get("/iot/devices", verifyUserToken, listIotDevices); // Purpose: list IoT devices; Data: none (auth only)
admin.put("/iot/disable/:deviceId", verifyUserToken, disableIotDevice); // Purpose: disable IoT device; Data: path param deviceId

export default admin;
