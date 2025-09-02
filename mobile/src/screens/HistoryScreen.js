// src/screens/HistoryScreen.js
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/my");
      setItems(data || []);
    } catch {
      Alert.alert("Erro", "Não foi possível carregar as reservas.");
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

  const openReceipt = (paymentIntentId) => {
    // Abre no Stripe Dashboard (modo test)
    const url = `https://dashboard.stripe.com/test/payments/${paymentIntentId}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Ops", "Não foi possível abrir o recibo.")
    );
  };

  const confirmCancel = (booking) => {
    Alert.alert(
      "Cancelar reserva",
      `Queres cancelar ${booking.venue?.name || "o recinto"} em ${booking.date} às ${
        booking.time
      }?`,
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: () => cancel(booking) },
      ]
    );
  };

  const cancel = async (booking) => {
    try {
      const { data } = await api.delete(`/bookings/${booking._id}`);
      setItems((prev) =>
        prev.map((b) => (b._id === booking._id ? { ...b, status: "cancelled" } : b))
      );
      Alert.alert("Reserva cancelada", data?.msg || "");
    } catch (e) {
      Alert.alert(
        "Não foi possível cancelar",
        e?.response?.data?.msg || "Tenta novamente."
      );
    }
  };

  const renderItem = ({ item }) => {
    const cancelled = item.status === "cancelled";
    return (
      <View style={s.card}>
        <View style={{ flex: 1 }}>
          <Text style={s.title} numberOfLines={1}>
            {item.venue?.name || "Recinto"}
          </Text>
          <Text style={s.sub}>
            {item.date} às {item.time}
          </Text>
          {cancelled ? <Text style={s.cancelled}>Cancelada</Text> : null}
        </View>

        <View style={s.actions}>
          {item.paymentIntentId ? (
            <TouchableOpacity
              style={s.secondaryBtn}
              onPress={() => openReceipt(item.paymentIntentId)}
            >
              <Ionicons name="receipt-outline" size={18} color="#8B0000" />
              <Text style={s.secondaryText}>Ver recibo</Text>
            </TouchableOpacity>
          ) : null}

          {!cancelled && (
            <TouchableOpacity style={s.cancelBtn} onPress={() => confirmCancel(item)}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={s.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const section = (label, data) => (
    <View style={{ marginTop: 16 }}>
      <Text style={s.sectionTitle}>{label}</Text>
      {data.length === 0 ? (
        <Text style={s.empty}>Sem registos.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );

  return (
    <FlatList
      data={[{ key: "container" }]}
      renderItem={() => (
        <View style={s.container}>
          {section("Próximos", upcoming)}
          {section("Passados", past)}
        </View>
      )}
      keyExtractor={(it) => it.key}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor="#8B0000" />
      }
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  empty: { opacity: 0.6, marginVertical: 8 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  sub: { opacity: 0.7 },
  cancelled: { marginTop: 6, color: "#A00", fontWeight: "600" },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: "#8B0000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  cancelBtnText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8B0000",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryText: { color: "#8B0000", marginLeft: 6, fontWeight: "600" },
});
