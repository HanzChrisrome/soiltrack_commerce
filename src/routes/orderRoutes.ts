// src/routes/orderRoutes.ts
import express from "express";
import { finalizeOrder } from "../controllers/orderController";

const router = express.Router();

router.post("/finalize", express.json(), finalizeOrder);

export default router;
