// src/routes/adminOrderRoutes.ts
import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/adminOrderController";

const router = express.Router();

// GET /api/admin/orders
router.get("/", getAllOrders);

// PUT /api/admin/orders/update-status
router.put("/update-status", updateOrderStatus);

export default router;
