// mobile/src/screens/PaymentCheckoutScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { STRIPE_PUBLISHABLE_KEY } from "../config/env";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import { colors, radius, spacing, typography } from "../theme";

export default function PaymentCheckoutScreen({ navigation, route }) {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const {
    venueId,
    venueName,
    date,
    time,
    amountCents = 1200,
    currency = "eur",
    venue,
  } = route?.params || {};

  const valid = useMemo(() => !!venueId && !!date && !!time, [venueId, date, time]);
  const isGoogle = String(venueId || "").startsWith("g:");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const prepare = async () => {
      setError("");
      if (!valid) {
        setError("Faltam dados da reserva. Volta ao passo anterior e confirma recinto, dia e hora.");
        setLoading(false);
        return;
      }
      if (!STRIPE_PUBLISHABLE_KEY) {
        setError(
          "Pagamento indisponivel: define EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY no mobile/.env para preparar o Stripe."
        );
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const r = await api.post("/payments/payment-sheet", {
          amount: amountCents,
          currency,
          customerEmail: user?.email,
        });
        const {
          paymentIntent,
          ephemeralKey,
          customer,
          paymentIntentId: preparedPaymentIntentId,
        } = r.data || {};
        if (!mounted) return;
        setPaymentIntentId(preparedPaymentIntentId);

        const { error: sheetError } = await initPaymentSheet({
          merchantDisplayName: "SportsRadar",
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          paymentIntentClientSecret: paymentIntent,
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: { email: user?.email || "" },
          returnURL: "exp+mobile://stripe-redirect",
        });
        if (sheetError) throw new Error(sheetError.message);

        if (mounted) setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.msg || e?.message || "Nao foi possivel preparar o pagamento.");
        setLoading(false);
      }
    };

    prepare();
    return () => {
      mounted = false;
    };
  }, [valid, amountCents, currency, initPaymentSheet, user?.email]);

  const onPay = async () => {
    if (!paymentIntentId) {
      setError("O pagamento ainda nao esta preparado. Tenta atualizar o ecra ou volta ao passo anterior.");
      return;
    }

    try {
      setPaying(true);
      const { error: sheetError } = await presentPaymentSheet();
      if (sheetError) {
        setError(sheetError.message || "Pagamento cancelado.");
        return;
      }
      const cap = await api.post("/payments/capture", { paymentIntentId });
      const receiptUrl = cap?.data?.receiptUrl || null;

      const payload = {
        venueId,
        date,
        time,
        amount: amountCents,
        currency,
        paymentIntentId,
        receiptUrl,
        ...(isGoogle
          ? {
              venueName: venue?.name || venueName || "",
              venueType: venue?.type || "",
              venueDistrict: venue?.district || "",
              venueAddress: venue?.address || "",
              imageUrl: venue?.imageUrl || "",
            }
          : {}),
      };

      await api.post("/bookings", payload);

      try {
        const Notifications = require("expo-notifications");
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reserva confirmada",
            body: `${payload.venueName || venueName || "Recinto"} - ${date} ${time}`,
          },
          trigger: null,
        });
      } catch {}

      Alert.alert("Reserva confirmada", "A tua reserva foi criada com sucesso.");
      navigation.navigate("Events");
    } catch (e) {
      setError(e?.response?.data?.msg || e?.message || "Nao foi possivel concluir o pagamento.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Pagamento</Text>
        <Text style={styles.title}>Confirmar e pagar</Text>
        <Text style={styles.subtitle}>O pagamento so e concluido atraves do Stripe PaymentSheet.</Text>
      </View>

      <ErrorBanner message={error} title="Pagamento indisponivel" style={styles.banner} />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Resumo da reserva</Text>
        <SummaryLine icon="business-outline" label="Recinto" value={venue?.name || venueName || "Recinto"} />
        <SummaryLine icon="calendar-outline" label="Dia" value={date || "Por confirmar"} />
        <SummaryLine icon="time-outline" label="Hora" value={time || "Por confirmar"} />
        <SummaryLine
          icon="cash-outline"
          label="Valor"
          value={`${(amountCents / 100).toFixed(2)} ${String(currency || "eur").toUpperCase()}`}
        />
      </Card>

      <Card style={styles.trustCard}>
        <View style={styles.trustIcon}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.trustText}>
          <Text style={styles.trustTitle}>Fluxo seguro de demo</Text>
          <Text style={styles.trustBody}>
            Sem chave Stripe valida, a app bloqueia o pagamento e mostra o motivo. A reserva so e criada apos pagamento confirmado.
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title={loading ? "A preparar pagamento" : "Pagar agora"}
          icon="card-outline"
          onPress={onPay}
          loading={loading || paying}
          disabled={!valid || !paymentIntentId}
        />
        <Button
          title="Voltar ao agendamento"
          variant="quiet"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    </View>
  );
}

function SummaryLine({ icon, label, value }) {
  return (
    <View style={styles.summaryLine}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  banner: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.sm,
  },
  summaryLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    ...typography.small,
    fontWeight: "800",
  },
  summaryValue: {
    ...typography.body,
    marginTop: 2,
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceAlt,
  },
  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  trustText: {
    flex: 1,
  },
  trustTitle: {
    ...typography.sectionTitle,
  },
  trustBody: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: "auto",
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
