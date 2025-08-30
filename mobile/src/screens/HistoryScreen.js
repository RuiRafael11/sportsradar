import React, { useCallback, useState } from "react";
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import styles from "../styles/HistoryStyles";
import { api } from "../services/api";

export default function HistoryScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await api.get("/bookings/me");
      setData(r.data || []);
    } catch (e) {
      setData([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // corre sempre que a tab fica visível
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

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
    </SafeAreaView>
  );
}
