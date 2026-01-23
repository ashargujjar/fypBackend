import Rider from "../models/rider.js";
export const getRider = async (req, res) => {
  try {
    const riders = await Rider.getRiders();
    return res.status(200).json({ success: true, riders: riders });
  } catch (err) {
    return res.status(401).json({ success: false, message: err });
  }
};
