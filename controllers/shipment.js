// -------------- Book Shipments ------------
export const bookShipment = async (req, res) => {
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
    paymentType,
    codAmount,
    useWallet,
    prepaidSource,
    deliveryCharge,
    amount,
  } = req.body;
  console.log(req.body);
  console.log(req.body.user);
  if (req.body) {
    return res.status(201).json({ s: "SD" });
  } else {
    return res.status(401).json({ as: "DFdf" });
  }
};
