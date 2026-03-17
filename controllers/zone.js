import Zone from "../models/zone.js";
import { CityZone } from "../schema/schema.js";

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return false;
  }
  return true;
};

const normalizeValue = (value) => String(value || "").trim();

const normalizeZones = (zones) => {
  if (!Array.isArray(zones)) return [];
  const cleaned = zones
    .map((zone) => normalizeValue(zone))
    .filter((zone) => zone.length > 0);
  const seen = new Set();
  return cleaned.filter((zone) => {
    const key = zone.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// -------- fetch the zones ----------
export const getZones = async (req, res) => {
  try {
    const zones = await Zone.getZones();
    if (zones) {
      return res.status(200).json({ success: true, zones });
    } else {
      throw new Error("error");
    }
  } catch (error) {
    return res
      .status(404)
      .json({ success: false, message: "no zone found " });
  }
};

// -------- admin: list cities ----------
export const getCities = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const cities = await CityZone.find().sort({ city: 1 });
    return res.status(200).json({ success: true, cities });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load cities",
    });
  }
};

// -------- admin: create city ----------
export const createCity = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const city = normalizeValue(req.body?.city);
    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "city is required" });
    }
    const zones = normalizeZones(req.body?.zones);
    const active =
      typeof req.body?.active === "boolean" ? req.body.active : true;

    const existing = await CityZone.findOne({ city });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "City already exists",
      });
    }

    const created = await CityZone.create({ city, zones, active });
    return res.status(201).json({ success: true, city: created });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create city",
    });
  }
};

// -------- admin: update city ----------
export const updateCity = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const cityId = req.params?.cityId;
    if (!cityId) {
      return res
        .status(400)
        .json({ success: false, message: "cityId is required" });
    }

    const city = await CityZone.findById(cityId);
    if (!city) {
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    }

    const nextCity = normalizeValue(req.body?.city);
    if (nextCity) {
      city.city = nextCity;
    }

    if (Array.isArray(req.body?.zones)) {
      city.zones = normalizeZones(req.body.zones);
    }

    if (typeof req.body?.active === "boolean") {
      city.active = req.body.active;
    }

    await city.save();
    return res.status(200).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to update city",
    });
  }
};

// -------- admin: add zone ----------
export const addZone = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const cityId = req.params?.cityId;
    const zone = normalizeValue(req.body?.zone);
    if (!cityId || !zone) {
      return res.status(400).json({
        success: false,
        message: "cityId and zone are required",
      });
    }

    const city = await CityZone.findById(cityId);
    if (!city) {
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    }

    const exists = city.zones.some(
      (item) => item.toLowerCase() === zone.toLowerCase(),
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Zone already exists",
      });
    }

    city.zones.push(zone);
    await city.save();
    return res.status(200).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to add zone",
    });
  }
};

// -------- admin: remove zone ----------
export const removeZone = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const cityId = req.params?.cityId;
    const zone = normalizeValue(req.body?.zone);
    if (!cityId || !zone) {
      return res.status(400).json({
        success: false,
        message: "cityId and zone are required",
      });
    }

    const city = await CityZone.findById(cityId);
    if (!city) {
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    }

    const nextZones = city.zones.filter(
      (item) => item.toLowerCase() !== zone.toLowerCase(),
    );
    city.zones = nextZones;
    await city.save();

    return res.status(200).json({ success: true, city });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove zone",
    });
  }
};

// -------- admin: delete city ----------
export const deleteCity = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const cityId = req.params?.cityId;
    if (!cityId) {
      return res
        .status(400)
        .json({ success: false, message: "cityId is required" });
    }

    const deleted = await CityZone.findByIdAndDelete(cityId);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    }

    return res.status(200).json({ success: true, city: deleted });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete city",
    });
  }
};
