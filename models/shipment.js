import mongoose from "mongoose";
import { SHIPMENT } from "../schema/schema.js";
import { RiderTasks, RIDER } from "../schema/schema.js";
class Shipment {
  constructor(
    userId,
    pickupAddress,
    pickupCity,
    pickupZone,
    receiverName,
    receiverPhone,
    deliveryAddress,
    deliveryCity,
    deliveryZone,
    weight,
    packageType,
    notes,
    codAmount,
    useWallet,
    delieveryCharges,
  ) {
    this.userId = userId;
    this.pickupAddress = pickupAddress;
    this.pickupCity = pickupCity;
    this.pickupZone = pickupZone;
    this.receiverName = receiverName;
    this.receiverPhone = receiverPhone;
    this.deliveryAddress = deliveryAddress;
    this.deliveryCity = deliveryCity;
    this.deliveryZone = deliveryZone;
    this.weight = weight;
    this.packageType = packageType;
    this.notes = notes;
    this.codAmount = codAmount;
    this.useWallet = useWallet;
    this.delieveryCharges = delieveryCharges;
  }
  async save() {
    const shipment = await SHIPMENT.create(this);
    return shipment;
  }
  static async getShipmentsByuserId(userId) {
    const shipment = await SHIPMENT.find({ userId });
    return shipment;
  }
  static async getShipmentById(shipmentId) {
    const shipment = await SHIPMENT.findById(shipmentId);
    return shipment;
  }
  static async getShipmentWithRiderDetails(shipmentId) {
    const riderTasksCollection = RiderTasks.collection.name;
    const ridersCollection = RIDER.collection.name;
    const shipmentObjectId = new mongoose.Types.ObjectId(shipmentId);
    const shipments = await SHIPMENT.aggregate([
      { $match: { _id: shipmentObjectId } },
      {
        $lookup: {
          from: riderTasksCollection,
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            {
              $lookup: {
                from: ridersCollection,
                localField: "riderId",
                foreignField: "_id",
                as: "rider",
              },
            },
            {
              $unwind: {
                path: "$rider",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "riderTasks",
        },
      },
      { $limit: 1 },
    ]);
    return shipments[0] || null;
  }
  static async getallShipments() {
    const shipments = await SHIPMENT.find();
    return shipments;
  }
  static async getAllShipmentsWithRiderDetails() {
    const riderTasksCollection = RiderTasks.collection.name;
    const ridersCollection = RIDER.collection.name;
    const shipments = await SHIPMENT.aggregate([
      {
        $lookup: {
          from: riderTasksCollection,
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            {
              $lookup: {
                from: ridersCollection,
                localField: "riderId",
                foreignField: "_id",
                as: "rider",
              },
            },
            {
              $unwind: {
                path: "$rider",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "riderTasks",
        },
      },
    ]);
    return shipments;
  }
  static async updateShipmentStatus(status, shipmentId) {
    const shipment = await SHIPMENT.findByIdAndUpdate(
      shipmentId,
      { status, riderStatus: status },
      { new: true },
    );

    return shipment;
  }
}

export default Shipment;
