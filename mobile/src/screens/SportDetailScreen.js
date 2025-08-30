import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function SportDetailScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const venue = params?.venue;

  if (!venue) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recinto não encontrado</Text>
      </View>
    );
  }

  const onSchedule = () => {
    navigation.navigate("ScheduleEvent", {
      venueId: venue._id,
      venueName: venue.name,
      venue,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{venue.name}</Text>
        {!!venue.district && <Text style={styles.district}>{venue.district}</Text>}
        {!!venue.type && <Text style={styles.type}>{venue.type}</Text>}
        {!!venue.notes && <Text style={styles.notes}>{venue.notes}</Text>}
      </View>

      <TouchableOpacity style={styles.cta} onPress={onSchedule}>
        <Text style={styles.ctaText}>Agendar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 16 },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  district: { fontSize: 16, color: "#555", marginBottom: 2 },
  type: { fontSize: 14, color: "#333", marginBottom: 8 },
  notes: { fontSize: 13, color: "#666" },
  cta: {
    backgroundColor: "#8B0000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
