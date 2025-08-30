import React, { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles/HistoryStyles";
import { api } from "../services/api";

function parseBookingDate(b) {
  // b.date: "YYYY-MM-DD", b.time: "HH:mm"
  const [y, m, d] = (b?.date || "").split("-").map(Number);
  const [hh, mm] = (b?.time || "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}

export default function HistoryScreen() {
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("upcoming"); // 'upcoming' | 'past'

  const load = async () => {
    try {
      const r = await api.get("/bookings/me");
      setList(r.data || []);
    } catch (e) {
      setList([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const arr = (list || []).slice().sort((a, b) => {
      const da = parseBookingDate(a)?.getTime() || 0;
      const db = parseBookingDate(b)?.getTime() || 0;
      return da - db;
    });
    return {
      upcoming: arr.filter((b) => (parseBookingDate(b) || now) >= now),
      past: arr.filter((b) => (parseBookingDate(b) || now) < now),
    };
  }, [list]);

  const data = tab === "upcoming" ? upcoming : past;

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "upcoming" && styles.tabBtnActive]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={[styles.tabTxt, tab === "upcoming" && styles.tabTxtActive]}>Próximos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "past" && styles.tabBtnActive]}
          onPress={() => setTab("past")}
        >
          <Text style={[styles.tabTxt, tab === "past" && styles.tabTxtActive]}>Passados</Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>
            {tab === "upcoming" ? "Sem reservas futuras" : "Sem reservas passadas"}
          </Text>
          <Text style={styles.emptySubtitle}>
            Faz uma reserva na aba “Find”.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text numberOfLines={1} style={styles.venueName}>
                  {item?.venue?.name || "Recinto"}
                </Text>
                <Text style={styles.badge}>{item?.venue?.type || "Reserva"}</Text>
              </View>
              <Text style={styles.when}>
                {item.date} às {item.time}
              </Text>
              {!!item?.venue?.district && (
                <Text style={styles.meta}>{item.venue.district}</Text>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
