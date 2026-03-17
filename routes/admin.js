import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { setRates } from "../controllers/rate.js";
import { signup } from "../controllers/user.js";
import {
  AdminInfoverviews,
  assignRider,
  getShipments,
} from "../controllers/admin.js";
const admin = express.Router();

admin.post("/signup", signup); // Purpose: admin signup; Data: JSON body with profile/credentials
admin.post("/assignRider", verifyUserToken, assignRider); // Purpose: assign rider to shipment; Data: JSON body with shipmentId + riderId
admin.get("/allShipments", verifyUserToken, getShipments); // Purpose: list all shipments; Data: query params (optional filters)
admin.get("/countDashboard", verifyUserToken, AdminInfoverviews); // Purpose: dashboard overview counts; Data: none (auth only)
admin.put("/rates", verifyUserToken, setRates); // Purpose: update delivery rates; Data: JSON body with rate config

export default admin;
