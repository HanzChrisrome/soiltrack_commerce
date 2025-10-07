// src/routes/adminOrderRoutes.ts
import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/adminOrderController";

const router = express.Router();

// ✅ GET all orders
router.get("/", getAllOrders);

// ✅ PUT update specific order’s status
router.put("/:orderId", updateOrderStatus);

export default router;
