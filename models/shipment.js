import mongoose from "mongoose";
import { SHIPMENT, RiderTasks, RIDER, IOT_ALERT } from "../schema/schema.js";

const normalizeTimelineLabel = (label) => {
  if (label === null || label === undefined) return "";
  return String(label).trim();
};

const buildTimelineEntry = ({ label, status, timestamp } = {}) => {
  const normalizedLabel = normalizeTimelineLabel(label);
  if (!normalizedLabel) return null;
  const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
  const entry = {
    label: normalizedLabel,
    timestamp: Number.isNaN(parsedTimestamp.getTime())
      ? new Date()
      : parsedTimestamp,
  };
  if (status) {
    entry.status = status;
  }
  return entry;
};

const buildFallbackTimeline = (shipment) => {
  if (!shipment) return [];
  const entries = [];
  const createdAt = shipment?.createdAt || null;
  const updatedAt = shipment?.updatedAt || null;
  const status = shipment?.status || "pending";

  if (createdAt) {
    const createdEntry = buildTimelineEntry({
      label: "Shipment Booked",
      status,
      timestamp: createdAt,
    });
    if (createdEntry) entries.push(createdEntry);
  }

  if (shipment?.status) {
    const statusTimestamp =
      updatedAt && createdAt && updatedAt !== createdAt
        ? updatedAt
        : updatedAt || createdAt || new Date();
    const statusEntry = buildTimelineEntry({
      label: shipment.status,
      status: shipment.status,
      timestamp: statusTimestamp,
    });
    if (statusEntry) entries.push(statusEntry);
  }

  return entries;
};
class Shipment {
  constructor(
    userId,
    pickupAddress,
    pickupLat,
    pickupLng,
    pickupCity,
    pickupZone,
    receiverName,
    receiverPhone,
    deliveryAddress,
    deliveryLat,
    deliveryLng,
    deliveryCity,
    deliveryZone,
    weight,
    minTemp,
    maxTemp,
    packageType,
    notes,
    codAmount,
    useWallet,
    delieveryCharges,
  ) {
    this.userId = userId;
    this.pickupAddress = pickupAddress;
    this.pickupLat = pickupLat;
    this.pickupLng = pickupLng;
    this.pickupCity = pickupCity;
    this.pickupZone = pickupZone;
    this.receiverName = receiverName;
    this.receiverPhone = receiverPhone;
    this.deliveryAddress = deliveryAddress;
    this.deliveryLat = deliveryLat;
    this.deliveryLng = deliveryLng;
    this.deliveryCity = deliveryCity;
    this.deliveryZone = deliveryZone;
    this.weight = weight;
    this.minTemp = minTemp;
    this.maxTemp = maxTemp;
    this.packageType = packageType;
    this.notes = notes;
    this.codAmount = codAmount;
    this.useWallet = useWallet;
    this.delieveryCharges = delieveryCharges;
    const initialTimeline = buildTimelineEntry({
      label: "Shipment Booked",
      status: "pending",
    });
    this.timeline = initialTimeline ? [initialTimeline] : [];
  }
  async save() {
    const shipment = await SHIPMENT.create(this);
    return shipment;
  }
  static createTimelineEntry({ label, status, timestamp } = {}) {
    return buildTimelineEntry({ label, status, timestamp });
  }
  static async appendTimelineEntry(shipmentId, entry) {
    const timelineEntry = buildTimelineEntry(entry);
    if (!timelineEntry) return null;
    const shipment = await SHIPMENT.findByIdAndUpdate(
      shipmentId,
      { $push: { timeline: timelineEntry } },
      { new: true },
    );
    return shipment;
  }
  static async getShipmentsByuserId(userId) {
    const shipmentObjectId = new mongoose.Types.ObjectId(userId);
    const alertsCollection = IOT_ALERT.collection.name;
    const shipments = await SHIPMENT.aggregate([
      { $match: { userId: shipmentObjectId } },
      {
        $lookup: {
          from: alertsCollection,
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $count: "count" },
          ],
          as: "alertSummary",
        },
      },
      {
        $addFields: {
          alertCount: {
            $ifNull: [{ $arrayElemAt: ["$alertSummary.count", 0] }, 0],
          },
        },
      },
      { $project: { alertSummary: 0 } },
    ]);
    return shipments;
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
    const shipment = shipments[0] || null;
    if (!shipment) return null;

    if (!Array.isArray(shipment.timeline) || shipment.timeline.length === 0) {
      const fallbackTimeline = buildFallbackTimeline(shipment);
      if (fallbackTimeline.length > 0) {
        await SHIPMENT.findByIdAndUpdate(shipment._id, {
          $set: { timeline: fallbackTimeline },
        });
        shipment.timeline = fallbackTimeline;
      }
    }

    return shipment;
  }
  static async getallShipments() {
    const shipments = await SHIPMENT.find();
    return shipments;
  }
  static async getAllShipmentsWithRiderDetails() {
    const riderTasksCollection = RiderTasks.collection.name;
    const ridersCollection = RIDER.collection.name;
    const alertsCollection = IOT_ALERT.collection.name;
    const shipments = await SHIPMENT.aggregate([
      {
        $lookup: {
          from: alertsCollection,
          let: { shipmentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$shipmentId", "$$shipmentId"] } } },
            { $count: "count" },
          ],
          as: "alertSummary",
        },
      },
      {
        $addFields: {
          alertCount: {
            $ifNull: [{ $arrayElemAt: ["$alertSummary.count", 0] }, 0],
          },
        },
      },
      { $project: { alertSummary: 0 } },
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
  static async updateShipmentStatus(status, shipmentId, options = {}) {
    const normalizedStatus =
      typeof status === "string" ? status.trim() : status;
    const timelineEntry = buildTimelineEntry({
      label: options.label || normalizedStatus,
      status: normalizedStatus,
      timestamp: options.timestamp,
    });
    const update = {
      $set: {
        status: normalizedStatus,
        riderStatus: normalizedStatus,
        ...(options.set || {}),
      },
    };
    if (timelineEntry) {
      update.$push = { timeline: timelineEntry };
    }
    if (options.unset && Object.keys(options.unset).length > 0) {
      update.$unset = options.unset;
    }
    const shipment = await SHIPMENT.findByIdAndUpdate(
      shipmentId,
      update,
      { new: true },
    );

    return shipment;
  }
}

export default Shipment;
