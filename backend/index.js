import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import newsRoutes from "./routes/news.js";
import weatherRoutes from "./routes/weather.js";
import supplierRoutes from "./routes/suppliers.js";
import riskRoutes from "./routes/risk.js";
import metricsRoutes from "./routes/metrics.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use("/api/news", newsRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/metrics", metricsRoutes);

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
