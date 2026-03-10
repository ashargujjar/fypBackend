import Rider from "../models/rider.js";
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
    const riderId = req.params?.riderId || req.query?.riderId;
    const tasks = await Rider.getRiderTasks(riderId);
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message || err });
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
