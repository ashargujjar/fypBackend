import Shipment from "../models/shipment.js";
import { PAYMENT } from "../schema/schema.js";

// ----------- getUserPayments -------------
export const getUserPayments = async (req, res) => {
  try {
    const shipments = await Shipment.getShipmentsByuserId(req.user.id);
    if (!shipments || shipments.length === 0) {
      return res.status(200).json({ success: true, payments: [] });
    }

    const shipmentIds = shipments.map((shipment) => shipment._id);
    const payments = await PAYMENT.find({ shipmentId: { $in: shipmentIds } });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
