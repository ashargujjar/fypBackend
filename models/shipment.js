import { SHIPMENT } from "../schema/schema.js";
class Shipment {
  constructor(
    userId,
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
    delieveryCharges
  ) {
    this.userId = userId;
    this.pickupAddress = pickupAddress;
    this.pickupCity = pickupCity;
    this.pickupZone = pickupZone;
    this.receiverName = receiverName;
    this.receiverPhone = receiverPhone;
    this.deliveryAddress = deliveryAddress;
    this.deliveryCity = deliveryCity;
    this.deliveryZone = deliveryZone;
    this.weight = weight;
    this.packageType = packageType;
    this.notes = notes;
    this.codAmount = codAmount;
    this.useWallet = useWallet;
    this.delieveryCharges = delieveryCharges;
  }
  async save() {
    const shipment = await SHIPMENT.create(this);
    return shipment;
  }
  static async getShipmentsByuserId(userId) {
    const shipment = await SHIPMENT.find({ userId });
    return shipment;
  }
  static async getShipmentById(shipmentId) {
    const shipment = await SHIPMENT.findById(shipmentId);
    return shipment;
  }
}

export default Shipment;
