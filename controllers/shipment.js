import Shipment from "../models/shipment.js";
import { SendMail } from "../src/mails.js";
import { Wallet, PAYMENT } from "../schema/schema.js";
import { shipmentBookedEmailTemplate } from "../emails/ShipmentBooked.js";
import User from "../models/user.js";
// -------------- Book Shipments ------------
export const bookShipment = async (req, res) => {
  try {
    const {
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
    } = req.body;
    console.log(req.body);
    const useWalletFlag = useWallet === true || useWallet === "true";
    const deliveryChargesNumber = Number(delieveryCharges);
    if (useWalletFlag) {
      const wallet = await User.getWalletBalance(req.user.id);
      if (!wallet) {
        return res
          .status(404)
          .json({ success: false, message: "Wallet not found" });
      }
      if (wallet.balance < deliveryChargesNumber) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance for delivery charges",
        });
      }
    }
    let amount = 0;
    if (!useWalletFlag) {
      amount = Number(delieveryCharges) + Number(codAmount); //all charges and cash on delivery
    } else {
      amount = Number(codAmount);
      await Wallet.updateOne(
        { userId: req.user.id },
        { $inc: { balance: -deliveryChargesNumber } }
      );
    }
    const shipment = new Shipment(
      req.user.id,
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
      amount,
      useWallet,
      delieveryCharges
    );
    const saved = await shipment.save();

    if (saved) {
      const shipmentId = saved._id;

      const paymentType = "COD";
      await PAYMENT.create({
        shipmentId,
        paymentType,
        codAmount: Number(codAmount),
        useWallet: useWalletFlag,
        deliveryCharges: deliveryChargesNumber,
        amount,
      });
      const pickupLocation = `${pickupAddress}, ${pickupZone}, ${pickupCity}`;
      const dropLocation = `${deliveryAddress}, ${deliveryZone}, ${deliveryCity}`;

      try {
        await SendMail({
          to: req.user.email,
          subject: "Your ShipSmart Shipment Has Been Booked",
          text: `Your shipment (${shipmentId}) has been booked successfully.`,
          html: shipmentBookedEmailTemplate({
            userName: req.user.name,
            shipmentId,
            pickupLocation,
            dropLocation,
            receiverName,
            receiverPhone,
            weight,
            packageType,
            deliveryCharges: delieveryCharges,
            codAmount,
            totalAmount: amount,
            bookingDate: new Date().toLocaleString(),
          }),
        });
        return res
          .status(201)
          .json({ success: true, message: "Shipment booked succesfully" });
      } catch (mailError) {
        console.error("Shipment email failed:", mailError);
        return res.status(201).json({
          success: true,
          message: "Shipment booked, but email failed to send",
          emailSent: false,
        });
      }
    } else {
      throw new Error("not saved");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUserShipments = async (req, res) => {
  const userId = req.user.id;
  const shipments = await Shipment.getShipmentsByuserId(userId);
  if (shipments) {
    return res.status(202).json({ success: true, shipments: shipments });
  } else {
    return res.stauts(404).json({
      success: true,
      messsage: "No shipment bookings found. Book now!",
    });
  }
};

export const trackShipmentById = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const shipment = await Shipment.getShipmentById(shipmentId);
    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found" });
    }
    return res.status(200).json({ success: true, shipment });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
