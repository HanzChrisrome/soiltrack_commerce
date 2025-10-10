// src/routes/orderRoutes.ts
import express from "express";
import {
  finalizeOrder,
  markOrderAsReceived,
} from "../controllers/orderController";
import { requestRefund } from "../controllers/refundController";

const router = express.Router();

// Finalize order (checkout)
router.post("/finalize", express.json(), finalizeOrder);

// Refund → sets shipping_status = "For Refund"
router.post("/refund", express.json(), (req, res) =>
  requestRefund({ ...req, body: { ...req.body, type: "refund" } } as any, res)
);

// Cancel → sets shipping_status = "For Cancellation"
router.post("/cancel", express.json(), (req, res) =>
  requestRefund({ ...req, body: { ...req.body, type: "cancel" } } as any, res)
);

// Mark as received
router.post("/mark-received", express.json(), markOrderAsReceived);

export default router;
