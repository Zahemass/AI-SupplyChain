// backend/routes/suppliers.js
import express from "express";
import { getSuppliersWithRisks } from "../controllers/suppliersController.js";

const router = express.Router();

// Default suppliers endpoint
router.get("/", getSuppliersWithRisks);

export default router;
