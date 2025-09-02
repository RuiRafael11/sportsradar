// src/screens/PaymentCheckoutScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PaymentCheckoutScreen({ navigation, route }) {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { venueId, venueName, date, time, amountCents = 1200, currency = "eur" } = route?.params || {};
  const valid = useMemo(() => !!venueId && !!date && !!time, [venueId, date, time]);

  const [loading, setLoading] = useState(true);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  useEffect(() => {
    const prepare = async () => {
      if (!valid) {
        Alert.alert("Pagamento", "Dados em falta (venueId, date, time)");
        navigation.goBack();
        return;
      }
      try {
        const r = await api.post("/payments/payment-sheet", {
          amount: amountCents,
          currency,
          customerEmail: user?.email,
        });
        const { paymentIntent, ephemeralKey, customer, paymentIntentId } = r.data || {};
        setPaymentIntentId(paymentIntentId);

        const { error } = await initPaymentSheet({
          merchantDisplayName: "SportsRadar",
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          paymentIntentClientSecret: paymentIntent,
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: { email: user?.email || "" },
          returnURL: "exp+mobile://stripe-redirect",
        });
        if (error) throw new Error(error.message);

        setLoading(false);
      } catch (e) {
        Alert.alert("Pagamento", e?.response?.data?.msg || e?.message || "Não foi possível preparar o pagamento");
        navigation.goBack();
      }
    };
    prepare();
  }, [valid]);

  const onPay = async () => {
    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        Alert.alert("Pagamento", error.message || "Pagamento cancelado");
        return;
      }
      const cap = await api.post("/payments/capture", { paymentIntentId });
      const receiptUrl = cap?.data?.receiptUrl || null;

      await api.post("/bookings", {
        venueId, date, time,
        paymentIntentId,
        receiptUrl,
      });

      // 🔔 notificação local imediata
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reserva confirmada ✅",
            body: `${venueName || "Recinto"} — ${date} ${time}`,
          },
          trigger: null,
        });
      } catch {}

      Alert.alert("Sucesso", "Reserva confirmada.");
      navigation.navigate("Events");
    } catch (e) {
      Alert.alert("Pagamento", e?.response?.data?.msg || e?.message || "Não foi possível concluir o pagamento");
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Pagamento</Text>
      <Text style={styles.sub}>Valor: {(amountCents / 100).toFixed(2)} €</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.payBtn} onPress={onPay}>
          <Text style={styles.payTxt}>Pagar agora</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginTop: 8 },
  sub: { marginTop: 8, fontSize: 16, color: "#444" },
  payBtn: { marginTop: 24, backgroundColor: "#8B0000", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  payTxt: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
