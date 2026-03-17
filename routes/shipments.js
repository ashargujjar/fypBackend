import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import { bookShipment } from "../controllers/shipment.js";
import { getAllShipments } from "../controllers/shipment.js";
import { getUserShipments } from "../controllers/shipment.js";
import { trackShipmentById } from "../controllers/shipment.js";
import { calculateDeliveryCharges } from "../controllers/rate.js";
const shipment = express.Router();
shipment.post("/bookShipment", verifyUserToken, bookShipment); // Purpose: create a shipment booking; Data: JSON body with shipment details
shipment.post("/calculateCharges", verifyUserToken, calculateDeliveryCharges); // Purpose: estimate delivery charges; Data: JSON body with weight/distance/zone
shipment.get("/getShipments", verifyUserToken, getUserShipments); // Purpose: list current user's shipments; Data: query params (optional filters)
shipment.get("/getAllShipments", verifyUserToken, getAllShipments); // Purpose: list all shipments; Data: query params (optional filters)
shipment.get("/trackShipment/:shipmentId", verifyUserToken, trackShipmentById); // Purpose: track shipment by ID; Data: path param shipmentId
export default shipment;
