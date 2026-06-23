// src/screens/HistoryScreen.js
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api, getApiErrorMessage } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import StatusPill from "../components/StatusPill";
import { colors, radius, spacing, typography } from "../theme";

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/bookings/my");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(getApiErrorMessage(e, "Nao foi possivel carregar as reservas."));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const toDate = (b) => new Date(`${b.date}T${b.time || "00:00"}:00`);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up = [];
    const pa = [];
    (items || []).forEach((b) => (toDate(b) >= now ? up : pa).push(b));
    up.sort((a, b) => toDate(a) - toDate(b));
    pa.sort((a, b) => toDate(b) - toDate(a));
    return { upcoming: up, past: pa };
  }, [items]);

  const openReceipt = (booking) => {
    if (booking?.receiptUrl) {
      Linking.openURL(booking.receiptUrl).catch(() =>
        Alert.alert("Recibo", "Nao foi possivel abrir o recibo.")
      );
      return;
    }

    if (booking?.paymentIntentId) {
      const url = `https://dashboard.stripe.com/test/payments/${booking.paymentIntentId}`;
      Linking.openURL(url).catch(() =>
        Alert.alert("Recibo", "Nao foi possivel abrir o recibo.")
      );
      return;
    }

    Alert.alert("Sem recibo", "Esta reserva nao tem recibo disponivel.");
  };

  const confirmCancel = (booking) => {
    const title = booking.venueName || booking.venue?.name || "o recinto";
    Alert.alert(
      "Cancelar reserva",
      `Queres cancelar ${title} em ${booking.date} as ${booking.time}?`,
      [
        { text: "Nao", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: () => cancel(booking) },
      ]
    );
  };

  const cancel = async (booking) => {
    try {
      const { data } = await api.delete(`/bookings/${booking._id}`);
      setItems((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "cancelled" } : b
        )
      );
      Alert.alert("Reserva cancelada", data?.msg || "Reserva atualizada.");
    } catch (e) {
      Alert.alert(
        "Nao foi possivel cancelar",
        e?.response?.data?.msg || "Tenta novamente."
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Reservas</Text>
        <Text style={styles.title}>Os teus eventos</Text>
        <Text style={styles.subtitle}>Consulta reservas futuras, recibos e historico de atividade.</Text>
      </View>

      <ErrorBanner message={loadError} title="Historico indisponivel" style={styles.banner} />

      <Stats upcoming={upcoming.length} past={past.length} />

      <Section
        title="Proximas"
        emptyTitle="Ainda nao tens reservas futuras"
        emptyMessage="Quando confirmares uma reserva, ela aparece aqui."
        data={upcoming}
        onReceipt={openReceipt}
        onCancel={confirmCancel}
      />

      <Section
        title="Historico"
        emptyTitle="Sem reservas anteriores"
        emptyMessage="As reservas passadas ficam guardadas nesta secao."
        data={past}
        onReceipt={openReceipt}
        onCancel={confirmCancel}
      />
    </ScrollView>
  );
}

function Stats({ upcoming, past }) {
  return (
    <View style={styles.stats}>
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{upcoming}</Text>
        <Text style={styles.statLabel}>Proximas</Text>
      </Card>
      <Card style={styles.statCard}>
        <Text style={styles.statValue}>{past}</Text>
        <Text style={styles.statLabel}>Historico</Text>
      </Card>
    </View>
  );
}

function Section({ title, emptyTitle, emptyMessage, data, onReceipt, onCancel }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length === 0 ? (
        <EmptyState compact icon="calendar-outline" title={emptyTitle} message={emptyMessage} />
      ) : (
        data.map((item) => (
          <BookingCard key={item._id} item={item} onReceipt={onReceipt} onCancel={onCancel} />
        ))
      )}
    </View>
  );
}

function BookingCard({ item, onReceipt, onCancel }) {
  const cancelled = item.status === "cancelled";
  const title = item.venueName || item.venue?.name || "Recinto";
  const metaType = (item.venueType || item.venue?.type || "").toString().trim().toLowerCase();
  const metaDistrict = (item.venueDistrict || item.venue?.district || "").toString().trim();
  const hasReceipt = item.receiptUrl || item.paymentIntentId;

  return (
    <Card style={styles.booking}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingIcon}>
          <Ionicons name="calendar-outline" size={19} color={colors.primary} />
        </View>
        <View style={styles.bookingText}>
          <Text style={styles.bookingTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.bookingWhen}>{item.date} as {item.time}</Text>
          {metaType || metaDistrict ? (
            <Text style={styles.bookingMeta}>
              {[metaType, metaDistrict].filter(Boolean).join(" - ")}
            </Text>
          ) : null}
        </View>
        {cancelled ? <StatusPill tone="danger">Cancelada</StatusPill> : <StatusPill tone="success">Confirmada</StatusPill>}
      </View>

      <View style={styles.actions}>
        {hasReceipt ? (
          <Button
            title="Recibo"
            icon="receipt-outline"
            variant="secondary"
            onPress={() => onReceipt(item)}
            style={styles.actionButton}
          />
        ) : null}
        {!cancelled ? (
          <TouchableOpacity activeOpacity={0.84} onPress={() => onCancel(item)} style={styles.cancelButton}>
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  stats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: colors.primary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  statLabel: {
    ...typography.small,
    fontWeight: "800",
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.md,
  },
  booking: {
    marginBottom: spacing.md,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bookingIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  bookingText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  bookingTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  bookingWhen: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  bookingMeta: {
    ...typography.small,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    minHeight: 42,
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#F4B9B4",
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.danger,
    fontWeight: "800",
    marginLeft: spacing.xs,
  },
});
