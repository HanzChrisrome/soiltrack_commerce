import type { Order } from "../models/order";
import axios from "axios";

export const fetchAllOrders = async (): Promise<Order[]> => {
  const response = await axios.get("http://localhost:5000/api/admin/orders");
  return response.data;
};
