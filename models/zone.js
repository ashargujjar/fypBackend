import { CityZone } from "../schema/schema.js";
class Zone {
  static async getZones() {
    try {
      const res = await CityZone.find();
      if (!res) {
        throw new Error("error fetching");
      }
      return res;
    } catch (error) {
      throw new Error("db error or error fetching");
    }
  }
}
export default Zone;
