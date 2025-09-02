// mobile/App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { StripeProvider } from "@stripe/stripe-react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Screens
import PaymentCheckoutScreen from "./src/screens/PaymentCheckoutScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ScheduleEventScreen from "./src/screens/ScheduleEventScreen";
import MapScreen from "./src/screens/MapScreen";
import SportDetailScreen from "./src/screens/SportDetailScreen";
import PushInitializer from "./src/components/PushInitializer"; // se já tens este ficheiro

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const FindStack = createNativeStackNavigator();

// 🔑 Publishable key vinda do app.json -> extra.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
const PUBLISHABLE_KEY =
  Constants?.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";

// Log de sanidade (vês no Metro / terminal do Expo – não imprime a chave inteira)
console.log("Stripe publishable key presente?", !!PUBLISHABLE_KEY);

// Stack da aba Find
function FindNavigator() {
  return (
    <FindStack.Navigator screenOptions={{ headerShown: true, title: "" }}>
      <FindStack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <FindStack.Screen name="SportDetail" component={SportDetailScreen} />
      <FindStack.Screen name="ScheduleEvent" component={ScheduleEventScreen} />
      <FindStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
    </FindStack.Navigator>
  );
}

// Tabs principais
function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Find"
        component={FindNavigator}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} /> }}
        listeners={({ navigation }) => ({
          tabPress: () => navigation.navigate("Find", { screen: "Map" }),
        })}
      />
      <Tab.Screen
        name="Events"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

// Decide auth
function RootNavigator() {
  const { user, booting } = useAuth();
  if (booting) return null;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={AppTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.sportsradar" // iOS Apple Pay (podes trocar mais tarde)
      urlScheme="exp+mobile" // returnURL para métodos com redirect
    >
      <AuthProvider>
        <NavigationContainer>
          {/* Push token saver (opcional) */}
          <PushInitializer />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}
