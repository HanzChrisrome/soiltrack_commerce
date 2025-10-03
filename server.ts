import express from "express";
import cors from "cors";
import path from "path";
import productsController from "./src/controllers/productsController.ts";
import cartController from "./src/controllers/cartController.ts";
import checkoutRoutes from "./src/routes/checkoutRoutes.ts";
import orderRoutes from "./src/routes/orderRoutes.ts";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.use(
  "/product_images",
  express.static(path.join(process.cwd(), "src/product_images"))
);

app.use("/api/products", productsController);
app.use("/api/cart", cartController);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
