import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import { getVenueImage, ImageFallback } from "../utils/images";

const COLORS = { bg: "#F4F6F8", card: "#FFFFFF", text: "#111827", sub: "#6B7280", brand: "#8B0000", border:"#E5E7EB" };

export default function SportDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const passedVenue = route?.params?.venue || null;
  const venueId =
    route?.params?.venueId ||
    route?.params?.id ||
    route?.params?._id ||
    passedVenue?._id ||
    null;

  const [loading, setLoading] = useState(true);
  const [venue, setVenue]   = useState(passedVenue);
  const [error, setError]   = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!venueId) throw new Error("ID do recinto em falta.");

        // 1) Se for interno -> busca ao /venues/:id
        if (!String(venueId).startsWith("g:")) {
          const r = await api.get(`/venues/${venueId}`);
          if (!mounted) return;
          setVenue(r.data);
          setLoading(false);
          return;
        }

        // 2) Se for Google -> usamos o `passedVenue` e adicionamos extras
        const base = passedVenue || { _id: venueId };
        // tenta extras
        const extra = await api.get(`/venue-extras/${encodeURIComponent(venueId)}`)
          .then(r => r.data)
          .catch(() => null);

        const merged = extra?.details ? { ...base, details: extra.details } : base;
        if (!mounted) return;
        setVenue(merged);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.msg || e.message || "Recinto não encontrado.");
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [venueId]);

  if (loading) {
    return <View style={[styles.container,{justifyContent:"center",alignItems:"center"}]}><ActivityIndicator/></View>;
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

  const d = venue.details || {};
  const amenities = [
    { key: "hasLockerRoom",   label: "Balneários", icon: "shirt-outline",       val: d.hasLockerRoom },
    { key: "hasShowers",      label: "Duches",     icon: "water-outline",       val: d.hasShowers },
    { key: "hasLighting",     label: "Iluminação", icon: "bulb-outline",        val: d.hasLighting },
    { key: "covered",         label: "Coberto",    icon: "umbrella-outline",    val: d.covered },
    { key: "indoor",          label: "Interior",   icon: "home-outline",        val: d.indoor },
    { key: "parking",         label: "Estacion.",  icon: "car-outline",         val: d.parking },
    { key: "equipmentRental", label: "Aluguer",    icon: "pricetag-outline",    val: d.equipmentRental },
  ];

  return (
    <View style={styles.container}>
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes</Text>

          <View style={styles.grid}>
            {amenities.map((a) => (
              <View key={a.key} style={styles.gridItem}>
                <View style={[styles.bullet, a.val ? styles.bulletOn : styles.bulletOff]}>
                  <Ionicons name={a.icon} size={18} color={a.val ? "#fff" : COLORS.sub} />
                </View>
                <Text style={[styles.gridText, a.val ? styles.onTxt : styles.offTxt]}>
                  {a.label}{a.val ? "" : " —"}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={styles.kv}>Piso: <Text style={styles.kvVal}>{d.surface || "—"}</Text></Text>
            <Text style={styles.kv}>
              Dimensões: <Text style={styles.kvVal}>
                {d.lengthMeters ? `${d.lengthMeters}m` : "—"} × {d.widthMeters ? `${d.widthMeters}m` : "—"}
              </Text>
            </Text>
            <Text style={styles.kv}>Preço/hora: <Text style={styles.kvVal}>{d.pricePerHour != null ? `${Number(d.pricePerHour).toFixed(2)} €` : "—"}</Text></Text>
            <Text style={styles.kv}>Horário: <Text style={styles.kvVal}>{d.openingHours || "—"}</Text></Text>
            <Text style={styles.kv}>
              Contacto: <Text style={styles.kvVal}>{d?.contact?.phone || d?.contact?.email || d?.contact?.website || "—"}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.cta, { marginTop: 16 }]}
          onPress={() => navigation.navigate("Find", {
            screen: "ScheduleEvent",
            params: { venueId, venueName: venue.name, venue } // passa o objeto já fundido
          })}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Agendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: COLORS.bg },
  title:{ fontSize:24, fontWeight:"800", color:COLORS.text },
  meta:{ color:COLORS.sub, marginTop:4 },
  row:{ flexDirection:"row", alignItems:"center", marginTop:10 },
  rowText:{ marginLeft:6, color:COLORS.text },
  card:{ marginTop:14, backgroundColor:COLORS.card, borderRadius:12, padding:12, borderWidth:1, borderColor:COLORS.border },
  sectionTitle:{ fontWeight:"800", color:COLORS.text, fontSize:16, marginBottom:8 },
  grid:{ flexDirection:"row", flexWrap:"wrap", gap:10 },
  gridItem:{ width:"30%", minWidth:110, flexDirection:"row", alignItems:"center" },
  bullet:{ width:28, height:28, borderRadius:14, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:COLORS.border, marginRight:8 },
  bulletOn:{ backgroundColor:COLORS.brand, borderColor:COLORS.brand },
  bulletOff:{ backgroundColor:"#fff" },
  gridText:{ fontSize:13 },
  onTxt:{ color:COLORS.text, fontWeight:"700" },
  offTxt:{ color:COLORS.sub },
  kv:{ color:COLORS.sub, marginTop:4 },
  kvVal:{ color:COLORS.text, fontWeight:"700" },
  cta:{ backgroundColor:COLORS.brand, paddingHorizontal:18, paddingVertical:12, borderRadius:12, alignSelf:"flex-start" },
});
