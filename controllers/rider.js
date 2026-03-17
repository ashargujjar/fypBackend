import Rider from "../models/rider.js";
import Shipment from "../models/shipment.js";
import {
  RiderTasks as RiderTasksModel,
  IOT_DEVICE,
  PAYMENT,
  Wallet,
} from "../schema/schema.js";
import { SendMail } from "../src/mails.js";
import { riderProfileUpdatedEmailTemplate } from "../emails/riderUpdated.js";
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
    const shouldAutoDetachIot = isDroppedAtOrigin || isDelivered;

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
            creditAmount =
              codAmount - (useWalletFlag ? 0 : deliveryCharges);
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

          payment.status = codAmount > 0 ? "Paid" : "Completed";
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
