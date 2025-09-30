// routes/ShopRoutes.tsx
import { Route } from "react-router-dom";
import Shop from "../pages/shop/Shop";

const ShopRoutes = () => (
  <>
    {/* All client-facing shop routes */}
    <Route path="shop" element={<Shop />} />
    {/* Later you can add: 
        <Route path="shop/:id" element={<ProductDetails />} /> 
        <Route path="cart" element={<Cart />} /> 
    */}
  </>
);

export default ShopRoutes;
