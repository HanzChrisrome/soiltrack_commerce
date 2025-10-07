import express from "express";
import { finalizeOrder } from "../controllers/orderController";
import { requestRefund } from "../controllers/refundController";

const router = express.Router();

// Existing routes
router.post("/finalize", express.json(), finalizeOrder);
router.post("/refund", requestRefund);

// ✅ Add this line — alias for cancellation requests
router.post("/cancel", requestRefund);

export default router;
