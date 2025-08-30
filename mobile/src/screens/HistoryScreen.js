// mobile/src/screens/HistoryScreen.js
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, ActivityIndicator } from "react-native";
import styles from "../styles/HistoryStyles";
import { api } from "../services/api";

export default function HistoryScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/bookings/me")
      .then((r) => setData(r.data || []))
      .catch(() => setData([]));
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Sem reservas</Text>
          <Text style={styles.emptySubtitle}>Faz a tua primeira reserva na aba “Find”.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.listContent}
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
    </SafeAreaView>
  );
}
