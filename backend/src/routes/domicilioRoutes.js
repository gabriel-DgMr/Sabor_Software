// backend/src/routes/domicilioRoutes.js
import express from "express";
import { getHistorialDomicilios } from "../controllers/domicilioController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/historial", authMiddleware, getHistorialDomicilios);

export default router;