import express from "express";
import cors from "cors";
import path from "path";
import productsController from "./src/controllers/productsController.js"; // add .js if using ESM

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ allow all CRUD
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json()); // replaces body-parser

// Serve static product images
app.use(
  "/product_images",
  express.static(path.join(process.cwd(), "src/product_images"))
);

// API routes
app.use("/api/products", productsController);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
