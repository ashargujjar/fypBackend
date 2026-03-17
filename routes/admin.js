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
import {
  getCities,
  createCity,
  updateCity,
  addZone,
  removeZone,
  deleteCity,
} from "../controllers/zone.js";
const admin = express.Router();

admin.post("/signup", signup); // Purpose: admin signup; Data: JSON body with profile/credentials
admin.post("/assignRider", verifyUserToken, assignRider); // Purpose: assign rider to shipment; Data: JSON body with shipmentId + riderId
admin.get("/allShipments", verifyUserToken, getShipments); // Purpose: list all shipments; Data: query params (optional filters)
admin.get("/countDashboard", verifyUserToken, AdminInfoverviews); // Purpose: dashboard overview counts; Data: none (auth only)
admin.put("/rates", verifyUserToken, setRates); // Purpose: update delivery rates; Data: JSON body with rate config
admin.post("/iot/register", verifyUserToken, registerIotDevice); // Purpose: register new IoT device; Data: JSON body with device details
admin.get("/iot/devices", verifyUserToken, listIotDevices); // Purpose: list IoT devices; Data: none (auth only)
admin.put("/iot/disable/:deviceId", verifyUserToken, disableIotDevice); // Purpose: disable IoT device; Data: path param deviceId
admin.get("/cities", verifyUserToken, getCities); // Purpose: list all city zones; Data: none (auth only)
admin.post("/cities", verifyUserToken, createCity); // Purpose: create city; Data: JSON body with city, zones, active
admin.put("/cities/:cityId", verifyUserToken, updateCity); // Purpose: update city; Data: path param + JSON body
admin.post("/cities/:cityId/zones", verifyUserToken, addZone); // Purpose: add zone to city; Data: path param + JSON body { zone }
admin.delete("/cities/:cityId/zones", verifyUserToken, removeZone); // Purpose: remove zone from city; Data: path param + JSON body { zone }
admin.delete("/cities/:cityId", verifyUserToken, deleteCity); // Purpose: delete city; Data: path param

export default admin;
