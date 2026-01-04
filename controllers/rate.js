import Rate from "../models/rate.js";

const normalizeCity = (value) => value.trim().toLowerCase();

export const setRates = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update rates.",
      });
    }

    const { perKgRate, intercityFixedRate, cityToCityRates } = req.body;
    const update = {};

    if (perKgRate !== undefined) {
      const value = Number(perKgRate);
      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "perKgRate must be a non-negative number.",
        });
      }
      update.perKgRate = value;
    }

    if (intercityFixedRate !== undefined) {
      const value = Number(intercityFixedRate);
      if (Number.isNaN(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: "intercityFixedRate must be a non-negative number.",
        });
      }
      update.intercityFixedRate = value;
    }

    if (cityToCityRates !== undefined) {
      if (!Array.isArray(cityToCityRates)) {
        return res.status(400).json({
          success: false,
          message: "cityToCityRates must be an array.",
        });
      }

      const normalized = [];
      for (const entry of cityToCityRates) {
        if (!entry || !entry.fromCity || !entry.toCity) {
          return res.status(400).json({
            success: false,
            message: "Each cityToCityRates entry needs fromCity and toCity.",
          });
        }
        const rateValue = Number(entry.rate);
        if (Number.isNaN(rateValue) || rateValue < 0) {
          return res.status(400).json({
            success: false,
            message: "Each cityToCityRates entry needs a non-negative rate.",
          });
        }
        normalized.push({
          fromCity: normalizeCity(entry.fromCity),
          toCity: normalizeCity(entry.toCity),
          rate: rateValue,
        });
      }
      update.cityToCityRates = normalized;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one rate field to update.",
      });
    }

    const saved = await Rate.upsertRates(update);
    return res.status(200).json({ success: true, rates: saved });
  } catch (error) {
    console.error("setRates error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating rates.",
    });
  }
};

export const calculateDeliveryCharges = async (req, res) => {
  try {
    const { pickupCity, deliveryCity, weight } = req.body;

    if (!pickupCity || !deliveryCity) {
      return res.status(400).json({
        success: false,
        message: "pickupCity and deliveryCity are required.",
      });
    }

    const weightValue = Number(weight);
    if (Number.isNaN(weightValue) || weightValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "weight must be a positive number.",
      });
    }

    const rates = await Rate.getRates();
    if (!rates) {
      return res.status(404).json({
        success: false,
        message: "Rates are not configured yet.",
      });
    }

    const normalizedPickup = normalizeCity(pickupCity);
    const normalizedDelivery = normalizeCity(deliveryCity);
    const perKgRate = Number(rates.perKgRate) || 0;
    const intercityFixedRate = Number(rates.intercityFixedRate) || 0;

    let fixedRate = 0;
    let rateSource = "intraCity";

    if (normalizedPickup !== normalizedDelivery) {
      const matched = (rates.cityToCityRates || []).find((entry) => {
        return (
          entry.fromCity === normalizedPickup &&
          entry.toCity === normalizedDelivery
        );
      });
      if (matched) {
        fixedRate = matched.rate;
        rateSource = "cityToCity";
      } else {
        const reverseMatched = (rates.cityToCityRates || []).find((entry) => {
          return (
            entry.fromCity === normalizedDelivery &&
            entry.toCity === normalizedPickup
          );
        });
        if (reverseMatched) {
          fixedRate = reverseMatched.rate;
          rateSource = "cityToCity";
        } else {
          fixedRate = intercityFixedRate;
          rateSource = "intercityFixed";
        }
      }
    }

    const baseCharge = perKgRate * weightValue;
    const deliveryCharges = baseCharge + fixedRate;

    return res.status(200).json({
      success: true,
      deliveryCharges,
      breakdown: {
        weight: weightValue,
        perKgRate,
        baseCharge,
        fixedRate,
        rateSource,
      },
    });
  } catch (error) {
    console.error("calculateDeliveryCharges error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while calculating charges.",
    });
  }
};
