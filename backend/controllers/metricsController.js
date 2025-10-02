// backend/controllers/metricsController.js
import { getCerebrasMetrics } from "../services/cerebrasClient.js";

export const getMetrics = (req, res) => {
  try {
    const metrics = getCerebrasMetrics();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to read metrics" });
  }
};
