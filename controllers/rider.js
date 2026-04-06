import Rider from "../models/rider.js";
import Shipment from "../models/shipment.js";
import {
  RiderTasks as RiderTasksModel,
  IOT_DEVICE,
  PAYMENT,
  Wallet,
  SHIPMENT,
} from "../schema/schema.js";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { SendMail } from "../src/mails.js";
import { riderProfileUpdatedEmailTemplate } from "../emails/riderUpdated.js";
import { otpEmailTemplate } from "../emails/otp.js";

const DELIVERY_PIN_VALIDITY_MINUTES = 5;
const generateDeliveryPin = () => Math.floor(1000 + Math.random() * 9000);
const normalizePin = (value) => String(value || "").trim();
export const getRider = async (req, res) => {
  try {
    const riders = await Rider.getRiders();
    return res.status(200).json({ success: true, riders: riders });
  } catch (err) {
    return res.status(401).json({ success: false, message: err });
  }
};
export const getRiderTasks = async (req, res) => {
  try {
    const riderId = req.params?.riderId || req.query?.riderId || req.user.id;
    const tasks = await Rider.getRiderTasks(riderId);
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message || err });
  }
};

export const sendDeliveryPin = async (req, res) => {
  try {
    const shipmentId = req.params?.shipmentId || req.body?.shipmentId;
    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: "shipmentId is required",
      });
    }

    const riderId = req.user?.id;
    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const shipment = await SHIPMENT.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      const task = await RiderTasksModel.findOne({
        shipmentId: shipment._id,
        riderId,
      });
      if (!task) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to send PIN for this shipment",
        });
      }
    }

    const customer = await User.getUserById(shipment.userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const pin = generateDeliveryPin();
    const pinHash = await bcrypt.hash(pin.toString(), 10);
    const expiresAt = new Date(
      Date.now() + DELIVERY_PIN_VALIDITY_MINUTES * 60 * 1000,
    );

    await SHIPMENT.findByIdAndUpdate(shipment._id, {
      deliveryPinHash: pinHash,
      deliveryPinExpiresAt: expiresAt,
      deliveryPinVerifiedAt: null,
      deliveryPinLastSentAt: new Date(),
    });

    await SendMail({
      to: customer.email,
      subject: "Your ShipSmart Delivery PIN",
      text: `Your delivery PIN is ${pin}. It is valid for ${DELIVERY_PIN_VALIDITY_MINUTES} minutes.`,
      html: otpEmailTemplate({
        userName: customer.name || "Customer",
        otp: pin,
        validityMinutes: DELIVERY_PIN_VALIDITY_MINUTES,
      }),
    });

    await Shipment.appendTimelineEntry(shipment._id, {
      label: "Delivery PIN sent",
      status: "PIN Sent",
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Delivery PIN sent to customer email",
      expiresAt,
    });
  } catch (error) {
    console.error("sendDeliveryPin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyDeliveryPin = async (req, res) => {
  try {
    const shipmentId = req.params?.shipmentId || req.body?.shipmentId;
    const rawPin = req.body?.pin ?? req.body?.otp;
    const pin = normalizePin(rawPin);

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        message: "shipmentId is required",
      });
    }

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: "PIN is required",
      });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be 4 digits",
      });
    }

    const riderId = req.user?.id;
    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const shipment = await SHIPMENT.findById(shipmentId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      const task = await RiderTasksModel.findOne({
        shipmentId: shipment._id,
        riderId,
      });
      if (!task) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to verify PIN for this shipment",
        });
      }
    }

    if (!shipment.deliveryPinHash || !shipment.deliveryPinExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No delivery PIN request found",
      });
    }

    const expiresAt = new Date(shipment.deliveryPinExpiresAt).getTime();
    if (Number.isFinite(expiresAt) && Date.now() > expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Delivery PIN expired. Please resend.",
      });
    }

    const isValid = await bcrypt.compare(pin, shipment.deliveryPinHash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid PIN. Try again.",
      });
    }

    await Shipment.updateShipmentStatus("PIN Verified", shipment._id, {
      set: {
        deliveryPinHash: null,
        deliveryPinExpiresAt: null,
        deliveryPinVerifiedAt: new Date(),
      },
      label: "PIN Verified",
    });

    const taskFilter = { shipmentId: shipment._id };
    if (!isAdmin) {
      taskFilter.riderId = riderId;
    }

    await RiderTasksModel.updateMany(taskFilter, { status: "PIN Verified" });

    return res.status(200).json({
      success: true,
      message: "PIN verified successfully",
    });
  } catch (error) {
    console.error("verifyDeliveryPin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateShipmentStatus = async (req, res) => {
  try {
    const shipmentId = req.params?.shipmentId || req.body?.shipmentId;
    const status =
      typeof req.body?.status === "string" ? req.body.status.trim() : "";

    if (!shipmentId) {
      return res
        .status(400)
        .json({ success: false, message: "shipmentId is required" });
    }

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "status is required" });
    }

    if (req.user?.role === "customer") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update shipment status",
      });
    }

    const normalizedStatus = status;
    const normalizedStatusLower = normalizedStatus.toLowerCase();
    const isDroppedAtOrigin =
      normalizedStatusLower.includes("dropped at origin hub") ||
      normalizedStatusLower.includes("dropped at warehouse") ||
      normalizedStatusLower.includes("droped at warehouse") ||
      normalizedStatusLower.includes("dropped at origin");
    const isDelivered = normalizedStatusLower.includes("delivered");
    const shouldUnassign = normalizedStatusLower === "dropped at origin hub";
    const shouldAutoDetachIot = isDelivered;

    const updatedShipment = await Shipment.updateShipmentStatus(
      normalizedStatus,
      shipmentId,
    );

    if (!updatedShipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }

    const taskFilter = { shipmentId: updatedShipment._id };
    if (req.user?.role !== "admin") {
      taskFilter.riderId = req.user?.id;
    }

    let shouldSaveShipment = false;

    if (shouldUnassign) {
      await RiderTasksModel.deleteMany(taskFilter);
      updatedShipment.riderStatus = "unassigned";
      shouldSaveShipment = true;
    } else {
      await RiderTasksModel.updateMany(taskFilter, { status: normalizedStatus });
    }

    if (shouldAutoDetachIot) {
      const now = new Date();
      let device = null;
      const currentDeviceId =
        typeof updatedShipment.iotDeviceId === "string"
          ? updatedShipment.iotDeviceId.trim()
          : "";

      if (currentDeviceId) {
        device = await IOT_DEVICE.findOne({ deviceId: currentDeviceId });
      }
      if (!device) {
        device = await IOT_DEVICE.findOne({
          assignedShipmentId: updatedShipment._id,
        });
      }

      if (device) {
        const assignedShipmentId = device.assignedShipmentId?.toString();
        if (!assignedShipmentId || assignedShipmentId === shipmentId) {
          if (device.status !== "Disabled") {
            device.status = "Available";
          }
          device.assignedShipmentId = null;
          device.assignedRiderId = null;
          device.detachedAt = now;
          device.lastActiveAt = now;
          await device.save();

          updatedShipment.iotDeviceId =
            updatedShipment.iotDeviceId || device.deviceId;
        }
      }

      if (updatedShipment.iotDeviceId || device) {
        updatedShipment.iotStatus = "detached";
        updatedShipment.iotDetachedAt = now;
        if (!Array.isArray(updatedShipment.timeline)) {
          updatedShipment.timeline = [];
        }
        const iotLabel = updatedShipment.iotDeviceId
          ? `IoT device detached (${updatedShipment.iotDeviceId})`
          : "IoT device detached";
        updatedShipment.timeline.push({
          label: iotLabel,
          status: "IoT detached",
          timestamp: now,
        });
        shouldSaveShipment = true;
      }
    }

    if (shouldSaveShipment) {
      await updatedShipment.save();
    }

    if (isDelivered) {
      const payment = await PAYMENT.findOne({
        shipmentId: updatedShipment._id,
      });

      if (payment) {
        const statusLower = String(payment.status || "").toLowerCase();
        const alreadySettled =
          statusLower.includes("paid") || statusLower.includes("completed");

        if (!alreadySettled) {
          const codAmount = Number(payment.codAmount || 0);
          const deliveryCharges = Number(payment.deliveryCharges || 0);
          const useWalletFlag = payment.useWallet === true;
          let creditAmount = 0;

          if (codAmount > 0) {
            const deliveryChargeToDeduct = useWalletFlag ? 0 : deliveryCharges;
            creditAmount = codAmount - deliveryChargeToDeduct;
          }

          if (creditAmount < 0) {
            creditAmount = 0;
          }

          if (creditAmount > 0) {
            await Wallet.updateOne(
              { userId: updatedShipment.userId },
              { $inc: { balance: creditAmount } },
            );
          }

          payment.status = "Paid";
          payment.transactionDate = new Date();
          await payment.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      shipment: updatedShipment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateRider = async (req, res) => {
  try {
    const riderId = req.params?.riderId || req.body?.riderId;
    if (!riderId) {
      return res
        .status(400)
        .json({ success: false, message: "riderId is required" });
    }

    const isAdmin = req.user?.role === "admin";
    const isSelf = req.user?.id === riderId;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this rider",
      });
    }

    const rider = await Rider.getRiderById(riderId);
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found" });
    }

    const { name, email, phone, assignedCity, riderCategory, assignedZone } =
      req.body;

    const hasUpdates =
      name ||
      email ||
      phone ||
      assignedCity ||
      riderCategory ||
      assignedZone !== undefined;
    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (email && email !== rider.email) {
      const existing = await Rider.getRiderByMail(email);
      if (existing && existing._id.toString() !== rider._id.toString()) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
      rider.email = email;
    }

    if (name) {
      rider.name = name;
    }
    if (phone) {
      rider.phone = phone;
    }
    if (assignedCity) {
      rider.assignedCity = assignedCity;
    }
    if (riderCategory) {
      const allowedCategories = ["pickup", "linehaul", "delivery"];
      if (!allowedCategories.includes(riderCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid riderCategory",
        });
      }
      rider.riderCategory = riderCategory;
    }
    if (assignedZone !== undefined) {
      rider.assignedZone = assignedZone;
    }

    const requiresZone =
      rider.riderCategory === "pickup" || rider.riderCategory === "delivery";
    if (requiresZone) {
      const zoneValue =
        typeof rider.assignedZone === "string"
          ? rider.assignedZone.trim()
          : rider.assignedZone;
      if (!zoneValue) {
        return res.status(400).json({
          success: false,
          message: "assignedZone is required for pickup or delivery",
        });
      }
    }

    await rider.save();

    const assignedZoneText = rider.assignedZone || "N/A";
    const textLines = [
      `Hello ${rider.name},`,
      "",
      "Your rider profile information was updated.",
      "",
      `Name: ${rider.name}`,
      `Email: ${rider.email}`,
      `Phone: ${rider.phone}`,
      `Assigned City: ${rider.assignedCity}`,
      `Rider Category: ${rider.riderCategory}`,
      `Assigned Zone: ${assignedZoneText}`,
      "",
      "If you did not request this change, please contact support.",
    ];

    await SendMail({
      to: rider.email,
      subject: "Your Rider Profile Was Updated",
      text: textLines.join("\n"),
      html: riderProfileUpdatedEmailTemplate({
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        assignedCity: rider.assignedCity,
        riderCategory: rider.riderCategory,
        assignedZone: assignedZoneText,
      }),
    });

    const safeRider = {
      id: rider._id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      assignedCity: rider.assignedCity,
      riderCategory: rider.riderCategory,
      assignedZone: rider.assignedZone,
      createdAt: rider.createdAt,
      updatedAt: rider.updatedAt,
    };

    return res.status(200).json({ success: true, rider: safeRider });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getRiderProfile = async (req, res) => {
  try {
    const riderId = req.user?.id;
    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const rider = await Rider.getRiderById(riderId);
    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found" });
    }

    const safeRider = {
      id: rider._id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      assignedCity: rider.assignedCity,
      riderCategory: rider.riderCategory,
      assignedZone: rider.assignedZone,
      createdAt: rider.createdAt,
      updatedAt: rider.updatedAt,
    };

    return res.status(200).json({ success: true, rider: safeRider });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const RemoveRider = async (req, res) => {
  const id = req.params?.riderId;
  try {
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      throw new Error("you are not authoize to delte the rider");
    }
    const rider = Rider.getRiderById(id);
    if (!rider) {
      return res
        .status(400)
        .json({ success: false, message: "rider with this id not found" });
    }
    const deletion = await Rider.removeRider(id);
    if (!deletion) {
      throw new Error("error removing the rider");
    }
    return res
      .status(200)
      .json({ success: true, message: "Rider deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error });
  }
};
