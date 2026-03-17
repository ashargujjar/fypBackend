import mongoose from "mongoose";
import {
  IOT_DEVICE,
  IOT_TELEMETRY,
  IOT_ALERT,
  SHIPMENT,
} from "../schema/schema.js";

const normalizeDeviceId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const isValidShipmentId = (shipmentId) =>
  mongoose.Types.ObjectId.isValid(shipmentId);

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseCoordinates = (body) => {
  const lat =
    toNumberOrNull(body?.latitude) ??
    toNumberOrNull(body?.lat) ??
    toNumberOrNull(body?.coords?.lat) ??
    toNumberOrNull(body?.coordinates?.lat) ??
    toNumberOrNull(body?.coordinates?.latitude);
  const lng =
    toNumberOrNull(body?.longitude) ??
    toNumberOrNull(body?.lng) ??
    toNumberOrNull(body?.coords?.lng) ??
    toNumberOrNull(body?.coordinates?.lng) ??
    toNumberOrNull(body?.coordinates?.longitude);
  return { latitude: lat, longitude: lng };
};

const parseShock = (body) => {
  let shockValue = toNumberOrNull(body?.shockValue);
  let shockFlag = body?.shock;
  if (typeof shockFlag === "string") {
    const normalized = shockFlag.trim().toLowerCase();
    shockFlag = normalized === "true" || normalized === "1" || normalized === "yes";
  }
  if (typeof shockFlag === "number") {
    shockFlag = shockFlag > 0;
  }
  if (shockFlag === undefined || shockFlag === null) {
    shockFlag = shockValue !== null ? shockValue > 0 : false;
  }
  if (shockValue === null && typeof shockFlag === "boolean") {
    shockValue = shockFlag ? 1 : 0;
  }
  return { shock: Boolean(shockFlag), shockValue };
};

export const registerIotDevice = async (req, res) => {
  try {
    const { deviceId, moduleType, firmwareVersion, simNumber, status, notes } =
      req.body || {};

    const normalizedId = normalizeDeviceId(deviceId);
    if (!normalizedId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const allowedStatuses = ["Available", "Assigned", "Disabled"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device status",
      });
    }

    const existing = await IOT_DEVICE.findOne({ deviceId: normalizedId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Device with this ID already exists",
      });
    }

    const device = await IOT_DEVICE.create({
      deviceId: normalizedId,
      moduleType: moduleType?.trim() || "IoT Module",
      firmwareVersion: firmwareVersion?.trim() || "",
      simNumber: simNumber?.trim() || "",
      notes: notes?.trim() || "",
      status: status || "Available",
      lastActiveAt: new Date(),
    });

    return res.status(201).json({ success: true, device });
  } catch (error) {
    console.error("registerIotDevice error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while registering device",
      detail: error?.message,
    });
  }
};

export const listIotDevices = async (req, res) => {
  try {
    const devices = await IOT_DEVICE.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, devices });
  } catch (error) {
    console.error("listIotDevices error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching devices",
      detail: error?.message,
    });
  }
};

export const disableIotDevice = async (req, res) => {
  try {
    const rawId = req.params?.deviceId || req.body?.deviceId;
    const normalizedId = normalizeDeviceId(rawId);

    if (!normalizedId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const device = await IOT_DEVICE.findOne({ deviceId: normalizedId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const assignedShipmentId = device.assignedShipmentId;
    const now = new Date();

    device.status = "Disabled";
    device.assignedShipmentId = null;
    device.assignedRiderId = null;
    device.detachedAt = now;
    device.lastActiveAt = now;
    await device.save();

    if (assignedShipmentId) {
      await SHIPMENT.findByIdAndUpdate(assignedShipmentId, {
        iotStatus: "detached",
        iotDetachedAt: now,
      });
    }

    return res.status(200).json({ success: true, device });
  } catch (error) {
    console.error("disableIotDevice error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while disabling device",
      detail: error?.message,
    });
  }
};

export const attachIotDevice = async (req, res) => {
  try {
    const { shipmentId, deviceId } = req.body || {};
    const normalizedId = normalizeDeviceId(deviceId);

    if (!shipmentId || !normalizedId) {
      return res.status(400).json({
        success: false,
        message: "shipmentId and deviceId are required",
      });
    }

    if (!isValidShipmentId(shipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipmentId",
      });
    }

    const device = await IOT_DEVICE.findOne({ deviceId: normalizedId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    if (device.status === "Disabled") {
      return res.status(400).json({
        success: false,
        message: "Device is disabled",
      });
    }

    const assignedShipmentId = device.assignedShipmentId?.toString();
    if (device.status === "Assigned" && assignedShipmentId !== shipmentId) {
      return res.status(409).json({
        success: false,
        message: "Device already assigned to another shipment",
      });
    }

    const shipment = await SHIPMENT.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const now = new Date();

    device.status = "Assigned";
    device.assignedShipmentId = shipment._id;
    device.assignedRiderId = req.user?.id || null;
    device.attachedAt = now;
    device.lastActiveAt = now;
    await device.save();

    shipment.iotDeviceId = device.deviceId;
    shipment.iotStatus = "attached";
    shipment.iotAttachedAt = now;
    shipment.iotDetachedAt = null;
    await shipment.save();

    return res.status(200).json({
      success: true,
      device,
      shipmentId: shipment._id,
      iotDeviceId: device.deviceId,
    });
  } catch (error) {
    console.error("attachIotDevice error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while attaching device",
      detail: error?.message,
    });
  }
};

export const detachIotDevice = async (req, res) => {
  try {
    const { shipmentId, deviceId } = req.body || {};
    const normalizedId = normalizeDeviceId(deviceId);

    if (!shipmentId || !normalizedId) {
      return res.status(400).json({
        success: false,
        message: "shipmentId and deviceId are required",
      });
    }

    if (!isValidShipmentId(shipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipmentId",
      });
    }

    const device = await IOT_DEVICE.findOne({ deviceId: normalizedId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const assignedShipmentId = device.assignedShipmentId?.toString();
    if (assignedShipmentId && assignedShipmentId !== shipmentId) {
      return res.status(409).json({
        success: false,
        message: "Device is assigned to a different shipment",
      });
    }

    const shipment = await SHIPMENT.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const now = new Date();

    if (device.status !== "Disabled") {
      device.status = "Available";
    }
    device.assignedShipmentId = null;
    device.assignedRiderId = null;
    device.detachedAt = now;
    device.lastActiveAt = now;
    await device.save();

    shipment.iotDeviceId = shipment.iotDeviceId || device.deviceId;
    shipment.iotStatus = "detached";
    shipment.iotDetachedAt = now;
    await shipment.save();

    return res.status(200).json({
      success: true,
      device,
      shipmentId: shipment._id,
    });
  } catch (error) {
    console.error("detachIotDevice error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while detaching device",
      detail: error?.message,
    });
  }
};

export const ingestIotTelemetry = async (req, res) => {
  try {
    const { deviceId, shipmentId, recordedAt } = req.body || {};
    const normalizedId = normalizeDeviceId(deviceId);
    if (!normalizedId) {
      return res.status(400).json({
        success: false,
        message: "deviceId is required",
      });
    }

    const device = await IOT_DEVICE.findOne({ deviceId: normalizedId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    let resolvedShipmentId =
      typeof shipmentId === "string" ? shipmentId.trim() : shipmentId;
    if (!resolvedShipmentId) {
      resolvedShipmentId = device.assignedShipmentId?.toString() || "";
    }
    if (!resolvedShipmentId) {
      const attachedShipment = await SHIPMENT.findOne({
        iotDeviceId: normalizedId,
        iotStatus: "attached",
      });
      if (attachedShipment) {
        resolvedShipmentId = attachedShipment._id.toString();
        device.assignedShipmentId = attachedShipment._id;
      }
    }

    if (!resolvedShipmentId || !isValidShipmentId(resolvedShipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid shipmentId is required",
      });
    }

    if (
      device.assignedShipmentId &&
      device.assignedShipmentId.toString() !== resolvedShipmentId
    ) {
      return res.status(409).json({
        success: false,
        message: "Device is assigned to a different shipment",
      });
    }

    const shipment = await SHIPMENT.findById(resolvedShipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const temperature =
      toNumberOrNull(req.body?.temperature) ??
      toNumberOrNull(req.body?.temp) ??
      toNumberOrNull(req.body?.tempC);
    const { latitude, longitude } = parseCoordinates(req.body);
    const { shock, shockValue } = parseShock(req.body);
    const recorded =
      recordedAt && !Number.isNaN(new Date(recordedAt).getTime())
        ? new Date(recordedAt)
        : new Date();

    const telemetry = await IOT_TELEMETRY.create({
      shipmentId: shipment._id,
      deviceId: normalizedId,
      temperature,
      latitude,
      longitude,
      shock,
      shockValue,
      recordedAt: recorded,
      raw: req.body?.raw ?? null,
    });

    device.lastActiveAt = new Date();
    await device.save();

    const alerts = [];
    const minTemp = toNumberOrNull(shipment.minTemp);
    const maxTemp = toNumberOrNull(shipment.maxTemp);

    if (temperature !== null) {
      if (minTemp !== null && temperature < minTemp) {
        alerts.push({
          shipmentId: shipment._id,
          deviceId: normalizedId,
          type: "TEMP_LOW",
          message: `Temperature below minimum (${temperature} < ${minTemp}).`,
          severity: "high",
          temperature,
          minTemp,
          maxTemp,
          latitude,
          longitude,
        });
      }
      if (maxTemp !== null && temperature > maxTemp) {
        alerts.push({
          shipmentId: shipment._id,
          deviceId: normalizedId,
          type: "TEMP_HIGH",
          message: `Temperature above maximum (${temperature} > ${maxTemp}).`,
          severity: "high",
          temperature,
          minTemp,
          maxTemp,
          latitude,
          longitude,
        });
      }
    }

    if (shock) {
      alerts.push({
        shipmentId: shipment._id,
        deviceId: normalizedId,
        type: "SHOCK",
        message: "Shock detected.",
        severity: "medium",
        temperature,
        latitude,
        longitude,
        shock,
        shockValue,
      });
    }

    let createdAlerts = [];
    if (alerts.length > 0) {
      createdAlerts = await IOT_ALERT.insertMany(alerts);
    }

    return res.status(201).json({
      success: true,
      telemetry,
      alerts: createdAlerts,
    });
  } catch (error) {
    console.error("ingestIotTelemetry error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving IoT data",
      detail: error?.message,
    });
  }
};

export const getShipmentTelemetry = async (req, res) => {
  try {
    const shipmentId = req.params?.shipmentId || req.query?.shipmentId;
    if (!shipmentId || !isValidShipmentId(shipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid shipmentId is required",
      });
    }

    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 50;

    const telemetry = await IOT_TELEMETRY.find({ shipmentId })
      .sort({ recordedAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, telemetry });
  } catch (error) {
    console.error("getShipmentTelemetry error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching IoT data",
      detail: error?.message,
    });
  }
};

export const getShipmentAlerts = async (req, res) => {
  try {
    const shipmentId = req.params?.shipmentId || req.query?.shipmentId;
    if (!shipmentId || !isValidShipmentId(shipmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid shipmentId is required",
      });
    }

    const alerts = await IOT_ALERT.find({ shipmentId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    console.error("getShipmentAlerts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching IoT alerts",
      detail: error?.message,
    });
  }
};
