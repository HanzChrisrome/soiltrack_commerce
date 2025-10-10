// routes/pointsRoutes.ts
import express from "express";
import { finalizeOrder } from "../controllers/orderController";
import { requestRefund } from "../controllers/refundController";
import supabase from "../lib/supabase";

const router = express.Router();

// Existing routes
router.post("/finalize", express.json(), finalizeOrder);
router.post("/refund", requestRefund);

// ✅ Alias for cancellation requests
router.post("/cancel", requestRefund);

// ✅ New route: Deduct points after checkout
router.post("/deduct-points", express.json(), async (req, res) => {
  try {
    const { user_id, points } = req.body;

    if (!user_id || typeof points !== "number") {
      return res.status(400).json({ error: "Missing user_id or points" });
    }

    // Fetch current points
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentPoints = user.points ?? 0;
    const newPoints = Math.max(currentPoints - points, 0);

    // Update points
    const { error: updateError } = await supabase
      .from("users")
      .update({ points: newPoints })
      .eq("user_id", user_id);

    if (updateError) {
      throw updateError;
    }

    return res.json({ success: true, points: newPoints });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
