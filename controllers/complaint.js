import cloudinary from "../config/cloudinary.js";
import { COMPLAINT, SHIPMENT } from "../schema/schema.js";
import { SendMail } from "../src/mails.js";

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "shipsmart",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        },
      )
      .end(fileBuffer);
  });

export const createComplaint = async (req, res) => {
  try {
    const { shipmentId, category, issue, image, complaintText } = req.body;
    const finalText = complaintText || issue;
    if (!shipmentId || !category || !finalText) {
      return res.status(400).json({
        success: false,
        message: "shipmentId, category, and issue are required.",
      });
    }

    const shipmentQuery = { _id: shipmentId };
    if (req.user?.id) {
      shipmentQuery.userId = req.user.id;
    }
    const shipment = await SHIPMENT.findOne(shipmentQuery);
    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found." });
    }

    let finalImage = image || "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      finalImage = result.secure_url;
    }

    const complaint = await COMPLAINT.create({
      shipmentId,
      category,
      complaintText: finalText,
      image: finalImage,
    });

    let emailSent = false;
    try {
      if (req.user?.email) {
        await SendMail({
          to: req.user.email,
          subject: "We received your complaint",
          text: `Hi ${req.user?.name || "there"},\n\nWe received your complaint.\n\nShipment ID: ${shipmentId}\nCategory: ${category}\nIssue: ${finalText}\nStatus: pending\n\nOur team will review it shortly.`,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2 style="margin: 0 0 12px;">We received your complaint</h2>
  <p>Hi ${req.user?.name || "there"},</p>
  <p>We received your complaint and our team will review it shortly.</p>
  <ul style="padding-left: 18px;">
    <li><strong>Shipment ID:</strong> ${shipmentId}</li>
    <li><strong>Category:</strong> ${category}</li>
    <li><strong>Issue:</strong> ${finalText}</li>
    <li><strong>Status:</strong> pending</li>
  </ul>
</div>`,
        });
        emailSent = true;
      }
    } catch (mailError) {
      console.error("Complaint email failed:", mailError);
    }

    return res.status(201).json({ success: true, complaint, emailSent });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const getComplaints = async (req, res) => {
  const userId = req.user.id;
  try {
    let shipments = await SHIPMENT.find({ userId });
    if (shipments) {
      const shipmentIds = shipments.map((s) => s._id);
      const complaints = await COMPLAINT.find({
        shipmentId: { $in: shipmentIds },
      });
      if (complaints) {
        return res.status(200).json({ success: true, complaints: complaints });
      } else {
        return res
          .status(200)
          .json({ success: true, message: "No complaints found" });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Your shipments is empty.Book your shipment now",
      });
    }
  } catch (error) {
    return res.status(400).json({ success: true, message: error });
  }
};
