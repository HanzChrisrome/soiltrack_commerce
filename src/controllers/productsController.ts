import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import supabase from "../lib/supabase";

const router = Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../product_images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
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

// POST /api/admin/products
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

    // Insert product into Supabase
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

export default router;
