import express from "express";
import { simulateEvent } from "../controllers/simulateEventController.js";

const router = express.Router();
router.post("/", simulateEvent);

export default router;
