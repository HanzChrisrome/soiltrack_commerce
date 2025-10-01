// src/routes/checkoutRoutes.ts
import { Router } from "express";
import { createCheckoutLink } from "../controllers/checkoutController";

const router = Router();
router.post("/create-payment-link", createCheckoutLink);

export default router;
