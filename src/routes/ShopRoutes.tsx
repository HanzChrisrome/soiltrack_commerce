// routes/ShopRoutes.tsx
import { Route } from "react-router-dom";
import Shop from "../pages/shop/Shop";
import Cart from "../pages/shop/Cart";
import ProductDetails from "../pages/shop/ProductDetails";

const ShopRoutes = () => (
  <>
    {/* All client-facing shop routes */}
    <Route path="shop" element={<Shop />} />

    <Route path="/product/:id" element={<ProductDetails />} />
    <Route path="cart" element={<Cart />} />
  </>
);

export default ShopRoutes;
