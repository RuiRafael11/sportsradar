// src/screens/PaymentCheckoutScreen.js
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import { initPaymentSheet, presentPaymentSheet, StripeProvider } from "@stripe/stripe-react-native";
import { createPaymentSheet } from "../stripe/api";
import { api } from "../services/api";
import Constants from "expo-constants";
export default function PaymentCheckoutScreen({ route, navigation }) {
  const publishableKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  const { bookingDraft } = route.params || {};
  // bookingDraft: { venueId, date, time, amountCents }

  const [ready, setReady] = useState(false);

  const initialize = useCallback(async () => {
    try {
      const amount = Number(bookingDraft?.amountCents || 1200); // €12
      const { paymentIntent, ephemeralKey, customer } = await createPaymentSheet({
        amount,
        currency: "eur",
      });

      const { error } = await initPaymentSheet({
  merchantDisplayName: "SportRadar",
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  paymentIntentClientSecret: paymentIntent,
  allowsDelayedPaymentMethods: false,
  returnURL: `${Constants.expoConfig?.scheme}://stripe-redirect`,
});

      if (!error) setReady(true);
      else Alert.alert("Erro", error.message);
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }, [bookingDraft]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const openSheet = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert(`Pagamento falhou`, error.message);
      return;
    }
    // Pagamento OK → criar a reserva no backend
    try {
      const body = {
        venueId: bookingDraft.venueId,
        date: bookingDraft.date,
        time: bookingDraft.time,
      };
      await api.post("/bookings", body);
      Alert.alert("Reserva registada!", "Pagamento confirmado.");
      navigation.navigate("Events");
    } catch (e) {
      Alert.alert("Reserva criada mas falhou o registo no servidor", e?.response?.data?.msg || e.message);
      navigation.navigate("Events");
    }
  };

  if (!publishableKey || publishableKey.startsWith("pk_test_") === false) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text>Configura EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY no app.json</Text>
      </SafeAreaView>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Pagamento</Text>
          <Text style={{ color: "#666", marginBottom: 16 }}>
            Valor: {(Number(bookingDraft?.amountCents || 1200) / 100).toFixed(2)} €
          </Text>

          {!ready ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity
              onPress={openSheet}
              style={{
                backgroundColor: "#8B0000",
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Pagar agora</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
}
