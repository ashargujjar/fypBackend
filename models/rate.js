import { RATE } from "../schema/schema.js";

class Rate {
  static async getRates() {
    return RATE.findOne();
  }

  static async upsertRates(update) {
    return RATE.findOneAndUpdate({}, { $set: update }, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }
}

export default Rate;
