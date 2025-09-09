// src/screens/SportDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import { getVenueImage, ImageFallback } from "../utils/images";

const COLORS = { bg: "#F4F6F8", card: "#FFFFFF", text: "#111827", sub: "#6B7280", brand: "#8B0000" };

export default function SportDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const passedVenue = route?.params?.venue || null; // pode ser Google
  const venueId =
    route?.params?.venueId ||
    route?.params?.id ||
    route?.params?._id ||
    passedVenue?._id ||
    null;

  const routeName = route?.params?.venueName || passedVenue?.name || "";

  const [loading, setLoading] = useState(!passedVenue);
  const [venue, setVenue] = useState(passedVenue);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchVenue() {
      try {
        if (!venueId) {
          setError("ID do recinto em falta.");
          return;
        }

        // Se for Google ("g:..."), assumimos que veio em passedVenue e não chamamos o backend
        if (String(venueId).startsWith("g:")) return;

        // tenta /venues/:id
        const r = await api.get(`/venues/${venueId}`);
        const data = Array.isArray(r.data) ? r.data[0] : r.data;
        if (data && data._id) {
          if (!mounted) return;
          setVenue(data);
          navigation.setOptions?.({ title: data.name || "Detalhe" });
          return;
        }

        // fallback /venues
        const rAll = await api.get("/venues");
        const list = Array.isArray(rAll.data) ? rAll.data : [];
        const found = list.find((v) => String(v._id) === String(venueId) || String(v.id) === String(venueId));
        if (found) {
          if (!mounted) return;
          setVenue(found);
          navigation.setOptions?.({ title: found.name || routeName || "Detalhe" });
          return;
        }

        setError("Recinto não encontrado.");
      } catch (e) {
        setError(e?.response?.data?.msg || "Recinto não encontrado.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (passedVenue) {
      navigation.setOptions?.({ title: passedVenue.name || "Detalhe" });
      setLoading(false);
    } else {
      setLoading(true);
      fetchVenue();
    }

    return () => { mounted = false; };
  }, [venueId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!venue || error) {
    return (
      <View style={[styles.container, { padding: 16 }]}>
        <Text style={{ color: COLORS.text, fontWeight: "700", marginBottom: 8 }}>
          {error || "Recinto não encontrado."}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cta}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CORREÇÃO: ImageFallback usa `uri`, não `source` */}
      <ImageFallback uri={getVenueImage(venue)} style={{ width: "100%", height: 220 }} />

      <View style={{ padding: 16 }}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.meta}>
          {String(venue.type || "").toLowerCase()} • {venue.district}
        </Text>

        <View style={styles.row}>
          <Ionicons name="location" size={18} color={COLORS.sub} />
          <Text style={styles.rowText}>{venue.address || "—"}</Text>
        </View>

        <TouchableOpacity
          style={[styles.cta, { marginTop: 16 }]}
          onPress={() =>
            navigation.navigate("Find", {
              screen: "ScheduleEvent",
              params: {
                venueId: venue._id || route?.params?.venueId || venueId,
                venueName: venue.name,
                venue: passedVenue || null, // quando for Google, leva o objeto
              },
            })
          }
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Agendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  meta: { color: COLORS.sub, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  rowText: { marginLeft: 6, color: COLORS.text },
  cta: { backgroundColor: COLORS.brand, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, alignSelf: "flex-start" },
});
