import bcrypt from "bcryptjs";
import Rider from "../models/rider.js";
import { SendMail } from "../src/mails.js";
import { riderWelcomeEmailTemplate } from "../emails/riderWelcome.js";

export const addRider = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      assignedCity,
      riderCategory,
      assignedZone,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !assignedCity ||
      !riderCategory
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const allowedCategories = ["pickup", "linehaul", "delivery"];
    if (!allowedCategories.includes(riderCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid riderCategory",
      });
    }

    if (
      (riderCategory === "pickup" || riderCategory === "delivery") &&
      !assignedZone
    ) {
      return res.status(400).json({
        success: false,
        message: "assignedZone is required for pickup or delivery",
      });
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const rider = new Rider(
      name,
      phone,
      email,
      hashPassword,
      assignedCity,
      riderCategory,
      assignedZone
    );

    const result = await rider.save();

    const assignedZoneText = assignedZone || "N/A";
    const textLines = [
      `Hello ${name},`,
      "",
      "Your rider account has been created.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Password: ${password}`,
      `Assigned City: ${assignedCity}`,
      `Rider Category: ${riderCategory}`,
      `Assigned Zone: ${assignedZoneText}`,
      "",
      "For security, please change your password after your first login.",
    ];

    await SendMail({
      to: email,
      subject: "Your Rider Account Details",
      text: textLines.join("\n"),
      html: riderWelcomeEmailTemplate({
        name,
        email,
        phone,
        password,
        assignedCity,
        riderCategory,
        assignedZone: assignedZoneText,
      }),
    });

    return res.status(201).json({ success: true, rider: result });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Rider with this email already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while adding rider",
    });
  }
};
