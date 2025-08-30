import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const heroByType = (type = "") => {
  const t = (type || "").toLowerCase();
  if (t.includes("padel")) return "https://images.unsplash.com/photo-1617957743099-1f716b795b77?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("futebol")) return "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("tenis")) return "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("pavilh")) return "https://images.unsplash.com/photo-1502810190503-8303352d0c69?q=80&w=1600&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1571731956672-ac8c9a859b1a?q=80&w=1600&auto=format&fit=crop";
};

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
      <Image source={{ uri: heroByType(venue.type) }} style={styles.hero} />
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
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  hero: { width: "100%", height: 180 },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: -20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    marginHorizontal: 16,
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
