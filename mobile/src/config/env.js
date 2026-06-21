import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || {};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  extra.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  extra.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  '';

if (!process.env.EXPO_PUBLIC_API_BASE_URL && !extra.EXPO_PUBLIC_API_BASE_URL) {
  console.warn('EXPO_PUBLIC_API_BASE_URL is not set. Falling back to localhost.');
}
