import express from "express";
import { verifyUserToken } from "../middleware/auth.js";
import {
  ingestIotTelemetry,
  getShipmentTelemetry,
  getShipmentAlerts,
} from "../controllers/iot.js";

const iot = express.Router();

iot.post("/telemetry", ingestIotTelemetry); // Purpose: ingest IoT telemetry; Data: JSON body from device
iot.get("/telemetry/:shipmentId", verifyUserToken, getShipmentTelemetry); // Purpose: list telemetry for a shipment; Data: shipmentId
iot.get("/alerts/:shipmentId", verifyUserToken, getShipmentAlerts); // Purpose: list alerts for a shipment; Data: shipmentId

export default iot;
