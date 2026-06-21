import axios from "axios";
import { API_BASE_URL } from "../config/env";

export const stripeApi = axios.create({ baseURL: API_BASE_URL });

export async function createPaymentSheet({ amount, currency = "eur" }) {
  const { data } = await stripeApi.post("/payments/payment-sheet", { amount, currency });
  return data; // { paymentIntent, ephemeralKey, customer }
}
