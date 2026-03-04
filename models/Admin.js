import USER from "../schema/schema.js";
import { SHIPMENT } from "../schema/schema.js";

class Admin {
  static async getDashboardCounts() {
    const [totalUsers, totalShipments, activeShipments, deliveredShipments] =
      await Promise.all([
        USER.countDocuments({
          role: "customer",
        }),
        SHIPMENT.countDocuments(),
        SHIPMENT.countDocuments({
          status: { $ne: "delivered" },
        }),
        SHIPMENT.countDocuments({
          status: "delivered",
        }),
      ]);
    return { totalUsers, totalShipments, activeShipments, deliveredShipments };
  }
}
export default Admin;
