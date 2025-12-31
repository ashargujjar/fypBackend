import Zone from "../models/zone.js";
// -------- fetch the zones ----------
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.getZones();
    if (zones) {
      return res.status(201).json({ success: true, zones: zones });
    } else {
      throw new Error("error");
    }
  } catch (error) {
    return res.status(404).josn({ success: false, message: "no zone found " });
  }
};
