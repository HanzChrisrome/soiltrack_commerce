// routes/ShopRoutes.tsx
import { Route } from "react-router-dom";
import Shop from "../pages/shop/Shop";
import Cart from "../pages/shop/Cart";
import ProductDetails from "../pages/shop/ProductDetails";
import CheckoutSuccess from "../pages/shop/CheckoutSuccess";
import CheckoutCancel from "../pages/shop/CheckoutCancel";
import Orders from "../pages/shop/Orders";

const ShopRoutes = () => (
  <>
    {/* All client-facing shop routes */}
    <Route path="shop" element={<Shop />} />
    <Route path="orders" element={<Orders />} />

    <Route path="/product/:id" element={<ProductDetails />} />
    <Route path="cart" element={<Cart />} />
    <Route path="checkout/success" element={<CheckoutSuccess />} />
    <Route path="checkout/cancel" element={<CheckoutCancel />} />
  </>
);

export default ShopRoutes;
