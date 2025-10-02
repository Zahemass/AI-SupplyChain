// backend/controllers/weatherController.js
import { fetchWeather } from "../services/weatherService.js";

export const getWeather = async (req, res) => {
  try {
    const city = req.query.city || "Chennai";
    const weather = await fetchWeather(city);

    if (!weather) return res.status(500).json({ error: "Weather fetch failed" });

    res.json(weather);
  } catch (err) {
    console.error("❌ getWeather error:", err.message);
    res.status(500).json({ error: "Weather API failed" });
  }
};
