// routes/cartController.ts
import { Router } from "express";
import supabase from "../../supabaseServer";

const router = Router();

/**
 * Add item to cart
 */
router.post("/add", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    // Check if item already exists
    const { data: existing, error: checkError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("cart_item_id", existing.cart_item_id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // Insert new
    const { data, error } = await supabase
      .from("cart_items")
      .insert([{ user_id, product_id, quantity }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error("❌ Error adding to cart:", err.message);
    res.status(500).json({ error: err.message || "Failed to add to cart" });
  }
});

/**
 * Get all items in a user's cart
 */
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        cart_item_id,
        user_id,
        quantity,
        products (
          product_id,
          product_name,
          product_price,
          product_image
        )
      `
      )
      .eq("user_id", user_id);

    if (error) throw error;

    // Flatten product fields
    const formatted = (data || []).map((item: any) => ({
      cart_item_id: item.cart_item_id,
      user_id: item.user_id,
      quantity: item.quantity,
      product_id: item.products?.product_id,
      product_name: item.products?.product_name,
      product_price: item.products?.product_price,
      product_image: item.products?.product_image,
    }));

    res.json(formatted);
  } catch (err: any) {
    console.error("❌ Error fetching cart:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch cart" });
  }
});

/**
 * Update item quantity
 */
router.put("/:cart_item_id", async (req, res) => {
  const { cart_item_id } = req.params;
  const { quantity } = req.body;

  try {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_item_id", cart_item_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    console.error("❌ Error updating quantity:", err.message);
    res.status(500).json({ error: err.message || "Failed to update quantity" });
  }
});

/**
 * Remove item from cart
 */
router.delete("/:cart_item_id", async (req, res) => {
  const { cart_item_id } = req.params;

  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_item_id", cart_item_id);

    if (error) throw error;

    res.json({ message: "Item removed successfully" });
  } catch (err: any) {
    console.error("❌ Error removing item:", err.message);
    res.status(500).json({ error: err.message || "Failed to remove item" });
  }
});

export default router;
