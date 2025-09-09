// mobile/src/screens/ScheduleEventScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CalendarComponent from "../components/CalendarComponent";
import TimePickerComponent from "../components/TimePickerComponent";
import { api } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { bg: "#f6f6f6", card:"#fff", text:"#111827", sub:"#6B7280", border:"#E5E7EB", brand:"#8B0000" };
const isMongoId = (s) => /^[a-fA-F0-9]{24}$/.test(String(s || ''));

export default function ScheduleEventScreen({ navigation, route }) {
  const passedVenue = route?.params?.venue || null; // pode vir do Google/Mapa/Home
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState(route?.params?.venueId || passedVenue?._id || null);
  const [venueName, setVenueName] = useState(route?.params?.venueName || passedVenue?.name || "");
  const [venueDetails, setVenueDetails] = useState(passedVenue || null); // objeto completo para mostrar detalhes

  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

// (usa a tua versão atual e troca apenas a parte que carrega detalhes)
useEffect(() => {
  let mounted = true;

  const load = async () => {
    if (!venueId) return;

    // se for id interno -> /venues/:id
    if (!String(venueId).startsWith("g:")) {
      setLoadingDetails(true);
      api.get(`/venues/${venueId}`)
        .then(r => { if (mounted) setVenueDetails(r.data || null); })
        .catch(() => { if (mounted) setVenueDetails(null); })
        .finally(() => setLoadingDetails(false));
      return;
    }

    // se for Google -> usa passedVenue e tenta extras
    const base = passedVenue || { _id: venueId, name: route?.params?.venueName || "" };
    setVenueDetails(base);
    try {
      const extra = await api.get(`/venue-extras/${encodeURIComponent(venueId)}`).then(r => r.data).catch(() => null);
      if (mounted && extra?.details) {
        setVenueDetails({ ...base, details: extra.details });
      }
    } finally { /* nada */ }
  };

  load();
  return () => { mounted = false; };
}, [venueId]);


  const onConfirm = () => {
    if (!venueId) return Alert.alert("Falta recinto", "Escolhe um recinto.");
    if (!selectedDay || !selectedTime) return Alert.alert("Atenção", "Seleciona o dia e a hora.");

    navigation.navigate("PaymentCheckout", {
      venueId,
      venueName,
      venue: passedVenue || venueDetails || null, // leva o objeto (útil p/ Google)
      date: selectedDay,
      time: selectedTime,
      amountCents: 1200,
      currency: "eur",
    });
  };

  const d = venueDetails?.details || {};
  const amenity = (ok, icon, label) => (
    <View style={s.amenity} key={label}>
      <View style={[s.dot, ok ? s.dotOn : s.dotOff]}>
        <Ionicons name={icon} size={16} color={ok ? "#fff" : COLORS.sub} />
      </View>
      <Text style={[s.amenityTxt, ok ? { fontWeight:"700", color: COLORS.text } : { color: COLORS.sub }]}>{label}{ok ? "" : " —"}</Text>
    </View>
  );

  return (
    <KeyboardAwareScrollView style={s.container} contentContainerStyle={s.content} enableOnAndroid keyboardShouldPersistTaps="handled" extraScrollHeight={80}>
      {/* Picker de recinto (apenas quando não veio por param/passedVenue) */}
      {!route?.params?.venueId && !passedVenue && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recinto</Text>
          {loadingVenues ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : (
            <View style={s.pickerWrap}>
              <Picker
                selectedValue={venueId}
                onValueChange={(val) => {
                  setVenueId(val);
                  const v = venues.find((x) => x._id === val);
                  setVenueName(v?.name || "");
                  setVenueDetails(v || null);
                }}
              >
                {venues.map((v) => (
                  <Picker.Item key={v._id} label={v.name} value={v._id} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      )}

      {/* DETALHES DO RECINTO */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Detalhes do recinto</Text>

        {loadingDetails ? (
          <ActivityIndicator style={{ marginTop: 8 }} />
        ) : venueDetails ? (
          <View style={s.card}>
            <Text style={s.title}>{venueDetails.name}</Text>
            <Text style={s.meta}>
              {String(venueDetails.type || "").toLowerCase()} • {venueDetails.district}
            </Text>
            {venueDetails.address ? <Text style={[s.meta, { marginTop: 2 }]}>{venueDetails.address}</Text> : null}

            <View style={s.amenitiesRow}>
              {amenity(!!d.hasLockerRoom, "shirt-outline", "Balneários")}
              {amenity(!!d.hasShowers, "water-outline", "Duches")}
              {amenity(!!d.hasLighting, "bulb-outline", "Iluminação")}
              {amenity(!!d.covered, "umbrella-outline", "Coberto")}
              {amenity(!!d.indoor, "home-outline", "Interior")}
              {amenity(!!d.parking, "car-outline", "Estacion.")}
              {amenity(!!d.equipmentRental, "pricetag-outline", "Aluguer")}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={s.kv}>
                Piso: <Text style={s.kvVal}>{d.surface || "—"}</Text>
              </Text>
              <Text style={s.kv}>
                Dimensões:{" "}
                <Text style={s.kvVal}>
                  {d.lengthMeters ? `${d.lengthMeters}m` : "—"} × {d.widthMeters ? `${d.widthMeters}m` : "—"}
                </Text>
              </Text>
              <Text style={s.kv}>
                Preço/hora:{" "}
                <Text style={s.kvVal}>
                  {d.pricePerHour != null ? `${Number(d.pricePerHour).toFixed(2)} €` : "—"}
                </Text>
              </Text>
              <Text style={s.kv}>
                Horário: <Text style={s.kvVal}>{d.openingHours || "—"}</Text>
              </Text>
              <Text style={s.kv}>
                Contacto:{" "}
                <Text style={s.kvVal}>
                  {d?.contact?.phone || d?.contact?.email || d?.contact?.website || "—"}
                </Text>
              </Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: COLORS.sub }}>Sem detalhes disponíveis.</Text>
        )}
      </View>

      {/* Dia */}
      <View className="section" style={s.section}>
        <Text style={s.sectionTitle}>Dia</Text>
        <CalendarComponent onDaySelect={setSelectedDay} />
        {selectedDay ? <Text>Selecionado: {selectedDay}</Text> : null}
      </View>

      {/* Hora */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Hora</Text>
        <TimePickerComponent selectedTime={selectedTime} onTimeChange={setSelectedTime} />
        {selectedTime ? <Text>Selecionado: {selectedTime}</Text> : null}
      </View>

      {/* CTA */}
      <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 24 }}>
        <TouchableOpacity style={s.confirmBtn} onPress={onConfirm}>
          <Text style={s.confirmText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flexGrow: 1, padding: 16, justifyContent: "flex-start" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: COLORS.text },

  pickerWrap: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fff" },

  card: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border
  },
  title: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  meta: { color: COLORS.sub, marginTop: 2 },

  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  amenity: { flexDirection: "row", alignItems: "center" },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", marginRight: 6 },
  dotOn: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  dotOff: { backgroundColor: "#fff" },
  amenityTxt: { fontSize: 13 },

  kv: { color: COLORS.sub, marginTop: 4 },
  kvVal: { color: COLORS.text, fontWeight: "700" },

  confirmBtn: { backgroundColor: COLORS.brand, paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 24 },
  confirmText: { color: "white", fontSize: 16, fontWeight: "600" },
});
