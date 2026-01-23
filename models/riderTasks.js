import { RiderTasks as RiderTasksModel } from "../schema/schema.js";
import Shipment from "./shipment.js";

class RiderTasks {
  constructor(riderId, shipmentId, status = "assigned") {
    this.riderId = riderId;
    this.shipmentId = shipmentId;
    this.status = status;
  }

  async assignRiderToShipment() {
    try {
      const existing = await RiderTasks.getTask(this.shipmentId, this.riderId);
      if (existing) {
        throw new Error("Task already assigned to the rider.");
      }
      await Shipment.updateShipmentStatus("pickup assigned", this.shipmentId);

      const task = await RiderTasksModel.create({
        shipmentId: this.shipmentId,
        riderId: this.riderId,
        status: this.status,
      });

      return task;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("error adding the rider to db");
    }
  }

  static async getTask(shipmentId, riderId) {
    return await RiderTasksModel.findOne({ shipmentId, riderId });
  }
}

export default RiderTasks;
