import express from "express";
import { runBenchmark } from "../controllers/benchmarkController.js";

const router = express.Router();

router.post("/", runBenchmark);

export default router;