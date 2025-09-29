import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import supabase from "../../supabaseServer.js";
import { fileURLToPath } from "url";

const router = Router();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "src/product_images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ✅ READ all products
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

// ✅ CREATE new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      product_name,
      product_category,
      product_price,
      product_quantity,
      product_description,
    } = req.body;

    if (
      !product_name ||
      !product_category ||
      !product_price ||
      !product_quantity
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let imagePath: string | null = null;
    if (req.file) {
      imagePath = `product_images/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        product_name,
        product_category,
        product_price: Number(product_price),
        product_quantity: Number(product_quantity),
        product_description: product_description || null,
        product_image: imagePath,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// ✅ UPDATE product
router.put("/:product_id", upload.single("image"), async (req, res) => {
  try {
    const { product_id } = req.params;
    const {
      product_name,
      product_category,
      product_price,
      product_quantity,
      product_description,
    } = req.body;

    let imagePath: string | undefined;
    if (req.file) {
      imagePath = `product_images/${req.file.filename}`;
    }

    const updateData: any = {
      product_name,
      product_category,
      product_price: Number(product_price),
      product_quantity: Number(product_quantity),
      product_description: product_description || null,
    };

    if (imagePath) updateData.product_image = imagePath;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("product_id", product_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

// ✅ DELETE product
router.delete("/:product_id", async (req, res) => {
  try {
    const { product_id } = req.params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", product_id);

    if (error) throw error;

    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

export default router;
