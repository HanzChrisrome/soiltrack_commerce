import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import supabase from "../../supabaseServer.js"; // note the .js if using ESM

// Polyfill __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "src/product_images"); // safer than __dirname
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

// POST /api/products
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

    let imageUrl: string | null = null;
    if (req.file) {
      // Build a public URL for the image
      imageUrl = `${req.protocol}://${req.get("host")}/product_images/${
        req.file.filename
      }`;
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
        product_image: imageUrl,
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
