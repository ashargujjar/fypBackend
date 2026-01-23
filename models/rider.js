import { RIDER } from "../schema/schema.js";

class Rider {
  constructor(
    name,
    phone,
    email,
    password,
    assignedCity,
    riderCategory,
    assignedZone,
  ) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.assignedCity = assignedCity;
    this.riderCategory = riderCategory;
    this.assignedZone = assignedZone;
  }

  async save() {
    try {
      const rider = await RIDER.create({
        name: this.name,
        phone: this.phone,
        email: this.email,
        password: this.password,
        assignedCity: this.assignedCity,
        riderCategory: this.riderCategory,
        assignedZone: this.assignedZone,
      });
      return rider;
    } catch (err) {
      console.error("Error saving rider:", err);
      throw err;
    }
  }
  static async getRiders() {
    try {
      const rider = await RIDER.find();
      return rider;
    } catch (error) {
      console.error("Error geting rider rider:", err);
      throw err;
    }
  }
  static async getRiderbyCityZone(assignedCity, assignedZone) {
    try {
      const riders = await RIDER.find({ assignedCity, assignedZone });
      return riders;
    } catch (error) {
      console.error("Error geting rider rider:", err);
      throw err;
    }
  }
}

export default Rider;
