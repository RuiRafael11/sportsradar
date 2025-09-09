// src/screens/ScheduleEventScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CalendarComponent from "../components/CalendarComponent";
import TimePickerComponent from "../components/TimePickerComponent";
import { api } from "../services/api";

export default function ScheduleEventScreen({ navigation, route }) {
  const passedVenue = route?.params?.venue || null; // ← pode vir do Google/Mapa/Home
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState(route?.params?.venueId || passedVenue?._id || null);
  const [venueName, setVenueName] = useState(route?.params?.venueName || passedVenue?.name || "");
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!venueId) {
      setLoadingVenues(true);
      api.get("/venues")
        .then((r) => {
          const arr = r.data || [];
          if (!mounted) return;
          setVenues(arr);
          if (arr?.[0]?._id) {
            setVenueId(arr[0]._id);
            setVenueName(arr[0].name || "");
          }
        })
        .catch(() => setVenues([]))
        .finally(() => setLoadingVenues(false));
    }
    return () => { mounted = false; };
  }, [venueId]);

  const onConfirm = () => {
    if (!venueId) return Alert.alert("Falta recinto", "Escolhe um recinto.");
    if (!selectedDay || !selectedTime) return Alert.alert("Atenção", "Seleciona o dia e a hora.");

    navigation.navigate("PaymentCheckout", {
      venueId,
      venueName,
      venue: passedVenue || null, // ← só quando existir (Google/Mapa)
      date: selectedDay,
      time: selectedTime,
      amountCents: 1200,
      currency: "eur",
    });
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} enableOnAndroid keyboardShouldPersistTaps="handled" extraScrollHeight={80}>
      {!route?.params?.venueId && !passedVenue && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recinto</Text>
          {loadingVenues ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : (
            <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fff" }}>
              <Picker
                selectedValue={venueId}
                onValueChange={(val) => {
                  setVenueId(val);
                  const v = venues.find((x) => x._id === val);
                  setVenueName(v?.name || "");
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dia</Text>
        <CalendarComponent onDaySelect={setSelectedDay} />
        {selectedDay ? <Text>Selecionado: {selectedDay}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hora</Text>
        <TimePickerComponent selectedTime={selectedTime} onTimeChange={setSelectedTime} />
        {selectedTime ? <Text>Selecionado: {selectedTime}</Text> : null}
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 24 }}>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  content: { flexGrow: 1, padding: 16, justifyContent: "flex-start" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  confirmBtn: { backgroundColor: "#8B0000", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 24 },
  confirmText: { color: "white", fontSize: 16, fontWeight: "600" },
});
