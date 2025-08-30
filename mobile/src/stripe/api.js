import axios from "axios";

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://192.168.1.5:5000/api";

export const stripeApi = axios.create({ baseURL });

export async function createPaymentSheet({ amount, currency = "eur" }) {
  const { data } = await stripeApi.post("/payments/payment-sheet", { amount, currency });
  return data; // { paymentIntent, ephemeralKey, customer }
}
