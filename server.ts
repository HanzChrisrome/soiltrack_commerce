import express from "express";
import cors from "cors";
import productsController from "./src/controllers/productsController";
import path from "path";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve images statically
app.use(
  "/product_images",
  express.static(path.join(__dirname, "product_images"))
);

// Admin routes
app.use("/api/admin/products", productsController);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
