import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Rider from "../models/rider.js";
import { SendMail } from "../src/mails.js";
import { riderWelcomeEmailTemplate } from "../emails/riderWelcome.js";
import Shipment from "../models/shipment.js";
import riderTasks from "../models/riderTasks.js";
import Admin from "../models/Admin.js";
import USER, {
  Wallet,
  SHIPMENT,
  PAYMENT,
  COMPLAINT,
  IOT_ALERT,
  IOT_TELEMETRY,
  RiderTasks,
  IOT_DEVICE,
} from "../schema/schema.js";

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return false;
  }
  return true;
};
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
      assignedZone,
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

export const getShipments = async (req, res) => {
  try {
    const shipment = await Shipment.getallShipments();
    if (!shipment) {
      throw new Error("shipments not found");
    }
    return res.status(200).json({ success: true, shipments: shipment });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
};

export const assignRider = async (req, res) => {
  try {
    const { shipmentId, riderId } = req.body;
    if (!shipmentId || !riderId) {
      return res.status(400).json({
        success: false,
        message: "shipmentId and riderId are required",
      });
    }
    const Tasks = new riderTasks(riderId, shipmentId);
    const resp = await Tasks.assignRiderToShipment();
    if (!resp) {
      throw new Error("un able to assign the rider");
    }
    return res
      .status(201)
      .json({ success: true, message: "rider task assigned succesfully" });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// --- get the dashboard counts
export const AdminInfoverviews = async (req, res) => {
  try {
    const dashboardCounts = await Admin.getDashboardCounts();
    return res
      .status(200)
      .json({ success: true, dashboardCounts: dashboardCounts });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "error accoured in fetching the counts",
    });
  }
};

export const getCustomers = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const customers = await USER.find({ role: "customer" })
      .select("name email phone isEmailVerified createdAt updatedAt")
      .lean();

    if (!customers || customers.length === 0) {
      return res.status(200).json({ success: true, customers: [] });
    }

    const customerIds = customers.map((customer) => customer._id);

    const [wallets, shipmentAgg, paymentAgg] = await Promise.all([
      Wallet.find({ userId: { $in: customerIds } })
        .select("userId balance")
        .lean(),
      SHIPMENT.aggregate([
        { $match: { userId: { $in: customerIds } } },
        { $sort: { createdAt: -1 } },
        {
          $addFields: {
            isDelivered: {
              $regexMatch: {
                input: { $toLower: { $ifNull: ["$status", ""] } },
                regex: "delivered",
              },
            },
          },
        },
        {
          $group: {
            _id: "$userId",
            totalShipments: { $sum: 1 },
            deliveredShipments: {
              $sum: { $cond: ["$isDelivered", 1, 0] },
            },
            activeShipments: {
              $sum: { $cond: ["$isDelivered", 0, 1] },
            },
            lastShipment: { $first: "$$ROOT" },
          },
        },
      ]),
      PAYMENT.aggregate([
        {
          $lookup: {
            from: SHIPMENT.collection.name,
            localField: "shipmentId",
            foreignField: "_id",
            as: "shipment",
          },
        },
        { $unwind: "$shipment" },
        { $match: { "shipment.userId": { $in: customerIds } } },
        {
          $addFields: {
            statusNormalized: {
              $toLower: { $ifNull: ["$status", ""] },
            },
          },
        },
        { $sort: { transactionDate: -1, createdAt: -1 } },
        {
          $group: {
            _id: "$shipment.userId",
            totalPayments: { $sum: 1 },
            paidPayments: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$statusNormalized",
                      regex: "paid|completed",
                    },
                  },
                  1,
                  0,
                ],
              },
            },
            pendingPayments: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$statusNormalized",
                      regex: "pending",
                    },
                  },
                  1,
                  0,
                ],
              },
            },
            lastPaymentStatus: { $first: "$status" },
            lastPaymentAt: { $first: "$transactionDate" },
            lastPaymentAmount: { $first: "$amount" },
          },
        },
      ]),
    ]);

    const walletMap = new Map(
      wallets.map((wallet) => [String(wallet.userId), wallet.balance]),
    );
    const shipmentMap = new Map(
      shipmentAgg.map((item) => [String(item._id), item]),
    );
    const paymentMap = new Map(
      paymentAgg.map((item) => [String(item._id), item]),
    );

    const formatted = customers.map((customer) => {
      const customerId = String(customer._id);
      const shipmentInfo = shipmentMap.get(customerId) || {};
      const paymentInfo = paymentMap.get(customerId) || {};
      const lastShipment = shipmentInfo.lastShipment || null;

      return {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isEmailVerified: customer.isEmailVerified,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        walletBalance: walletMap.get(customerId) ?? 0,
        shipmentStats: {
          total: shipmentInfo.totalShipments || 0,
          active: shipmentInfo.activeShipments || 0,
          delivered: shipmentInfo.deliveredShipments || 0,
        },
        lastShipment: lastShipment
          ? {
              id: lastShipment._id,
              status: lastShipment.status,
              pickupAddress: lastShipment.pickupAddress,
              pickupCity: lastShipment.pickupCity,
              pickupZone: lastShipment.pickupZone,
              deliveryAddress: lastShipment.deliveryAddress,
              deliveryCity: lastShipment.deliveryCity,
              deliveryZone: lastShipment.deliveryZone,
              createdAt: lastShipment.createdAt,
              updatedAt: lastShipment.updatedAt,
            }
          : null,
        paymentStats: {
          total: paymentInfo.totalPayments || 0,
          paid: paymentInfo.paidPayments || 0,
          pending: paymentInfo.pendingPayments || 0,
          lastStatus: paymentInfo.lastPaymentStatus || null,
          lastAt: paymentInfo.lastPaymentAt || null,
          lastAmount:
            paymentInfo.lastPaymentAmount !== undefined
              ? paymentInfo.lastPaymentAmount
              : null,
        },
      };
    });

    return res.status(200).json({ success: true, customers: formatted });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
      detail: error?.message,
    });
  }
};

export const removeCustomer = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const customerId = req.params?.customerId;
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid customerId is required",
      });
    }

    const customer = await USER.findOne({
      _id: customerId,
      role: "customer",
    }).select("_id name email");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const shipments = await SHIPMENT.find({ userId: customerId })
      .select("_id iotDeviceId")
      .lean();
    const shipmentIds = shipments.map((shipment) => shipment._id);
    const deviceIds = shipments
      .map((shipment) => String(shipment?.iotDeviceId || "").trim())
      .filter(Boolean);

    if (shipmentIds.length > 0) {
      const now = new Date();
      await Promise.all([
        PAYMENT.deleteMany({ shipmentId: { $in: shipmentIds } }),
        COMPLAINT.deleteMany({ shipmentId: { $in: shipmentIds } }),
        IOT_ALERT.deleteMany({ shipmentId: { $in: shipmentIds } }),
        IOT_TELEMETRY.deleteMany({ shipmentId: { $in: shipmentIds } }),
        RiderTasks.deleteMany({ shipmentId: { $in: shipmentIds } }),
      ]);

      await IOT_DEVICE.updateMany(
        {
          $or: [
            { assignedShipmentId: { $in: shipmentIds } },
            deviceIds.length ? { deviceId: { $in: deviceIds } } : null,
          ].filter(Boolean),
        },
        {
          $set: {
            assignedShipmentId: null,
            assignedRiderId: null,
            detachedAt: now,
            lastActiveAt: now,
          },
        },
      );

      await SHIPMENT.deleteMany({ _id: { $in: shipmentIds } });
    }

    await Wallet.deleteOne({ userId: customerId });
    await USER.deleteOne({ _id: customerId });

    return res.status(200).json({
      success: true,
      message: "Customer removed successfully",
      removedShipments: shipmentIds.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while removing customer",
      detail: error?.message,
    });
  }
};
