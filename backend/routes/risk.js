import express from "express";
import { getRisk } from "../controllers/riskController.js";

const router = express.Router();
router.get("/", getRisk);

export default router;
