// mobile/src/screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.address}>Rua Dr. Júlio Martins, 1</Text>
        <Ionicons name="chevron-down" size={16} color="black" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Suggestions */}
        <Text style={styles.sectionTitle}>Suggestions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: '#8B0000' }]}>
            <Text style={styles.cardTitle}>Judo</Text>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/1085/1085965.png" }}
              style={styles.cardImage}
            />
            <Ionicons name="heart-outline" size={20} color="white" style={styles.heartIcon} />
          </View>
        </ScrollView>

        {/* Favorites */}
        <Text style={styles.sectionTitle}>Favorites</Text>
        <View style={[styles.cardLarge, { backgroundColor: '#004d00' }]}>
          <Text style={styles.favoriteText}>Football 5 Indoor</Text>
          <Text style={styles.dateText}>Wednesday - 17/08 at 09:30</Text>
        </View>
        <View style={[styles.cardLarge, { backgroundColor: '#4682b4' }]}>
          <Text style={styles.favoriteText}>Swimming in the pool</Text>
          <Text style={styles.dateText}>Saturday - 19/09 at 09:30</Text>
        </View>
        <View style={[styles.cardLarge, { backgroundColor: '#b22222' }]}>
          <Text style={styles.favoriteText}>Outdoor running</Text>
          <Text style={styles.dateText}>Sunday - 21/03 at 09:30</Text>
        </View>
      </ScrollView>
      {/* sem bottomNav aqui – a TabBar já vem do navigator */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6", paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  address: { fontSize: 16, fontWeight: "bold", marginRight: 6 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    width: 120, height: 140, borderRadius: 12, padding: 10, marginRight: 10, justifyContent: "space-between",
  },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cardImage: { width: 50, height: 50, alignSelf: "center", marginVertical: 8 },
  heartIcon: { alignSelf: "flex-end" },
  cardLarge: { width: "100%", padding: 16, borderRadius: 12, marginBottom: 12 },
  favoriteText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  dateText: { color: "#fff" },
});
