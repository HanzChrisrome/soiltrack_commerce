// src/routes/adminOrderRoutes.ts
import express from "express";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/adminOrderController";

const router = express.Router();

// ✅ GET all orders
router.get("/", getAllOrders);

// ✅ PUT update specific order's shipping status
router.put("/update-status", updateOrderStatus);

// ✅ PUT update specific order's payment status
router.put("/update-payment-status", updatePaymentStatus);

export default router;
