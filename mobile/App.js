// mobile/App.js
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "./src/config/env";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { colors, typography } from "./src/theme";

import PaymentCheckoutScreen from "./src/screens/PaymentCheckoutScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ScheduleEventScreen from "./src/screens/ScheduleEventScreen";
import MapScreen from "./src/screens/MapScreen";
import SportDetailScreen from "./src/screens/SportDetailScreen";
import HelpScreen from "./src/screens/HelpScreen";
import AboutScreen from "./src/screens/AboutScreen";
import PushInitializer from "./src/components/PushInitializer";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const FindStack = createNativeStackNavigator();

const PUBLISHABLE_KEY = STRIPE_PUBLISHABLE_KEY;

function FindNavigator() {
  return (
    <FindStack.Navigator
      screenOptions={{
        headerShown: true,
        title: "",
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <FindStack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <FindStack.Screen name="SportDetail" component={SportDetailScreen} options={{ title: "Recinto" }} />
      <FindStack.Screen name="ScheduleEvent" component={ScheduleEventScreen} options={{ title: "Reserva" }} />
      <FindStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} options={{ title: "Pagamento" }} />
    </FindStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontWeight: "800", fontSize: 12 },
      }}
    >
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
          tabPress: () => navigation.jumpTo("Find", { screen: "Map" }),
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

function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.bootText}>A iniciar SportsRadar...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={AppTabs} />
          <Stack.Screen name="Help" component={HelpScreen} options={{ headerShown: true, title: "Ajuda" }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true, title: "Sobre" }} />
        </>
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
      merchantIdentifier="merchant.com.sportsradar"
      urlScheme="exp+mobile"
    >
      <AuthProvider>
        <NavigationContainer>
          <PushInitializer />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  bootText: {
    ...typography.subtitle,
    marginTop: 12,
  },
});
