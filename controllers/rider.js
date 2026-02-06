import Rider from "../models/rider.js";
export const getRider = async (req, res) => {
  try {
    const riders = await Rider.getRiders();
    return res.status(200).json({ success: true, riders: riders });
  } catch (err) {
    return res.status(401).json({ success: false, message: err });
  }
};
export const getRiderTasks = async (req, res) => {
  try {
    const riderId = req.params?.riderId || req.query?.riderId;
    const tasks = await Rider.getRiderTasks(riderId);
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message || err });
  }
};
