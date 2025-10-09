import axios from "axios";

const API_URL = "http://localhost:5000/api/cart";

export const cartService = {
  addToCart: (user_id: string, product_id: string, quantity: number) =>
    axios.post(`${API_URL}/add`, { user_id, product_id, quantity }).then((res) => res.data),

  getCart: (user_id: string) =>
    axios.get(`${API_URL}/${user_id}`).then((res) => res.data),

  updateQuantity: (cart_item_id: string, quantity: number) =>
    axios.put(`${API_URL}/${cart_item_id}`, { quantity }).then((res) => res.data),

  removeItem: (cart_item_id: string) =>
    axios.delete(`${API_URL}/${cart_item_id}`).then((res) => res.data),
};
