import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/SportDetailStyles";
import { api } from "../services/api";

export default function SportDetailScreen({ navigation, route }) {
  // prioridade: usa o objeto completo se vier nos params
  const [venue, setVenue] = useState(route?.params?.venue || null);
  const venueId = route?.params?.venueId || venue?._id;

  useEffect(() => {
    let mounted = true;

    // só faz request se NÃO recebemos o objeto 'venue' mas temos um id
    if (!venue && venueId) {
      (async () => {
        try {
          const { data } = await api.get(`/venues/${venueId}`);
          if (mounted) setVenue(data);
        } catch (e) {
          Alert.alert("Erro", "Não foi possível carregar o recinto.");
        }
      })();
    }

    return () => { mounted = false; };
  }, [venueId]);

  // se não há nem venue nem venueId, não temos como mostrar detalhe
  if (!venue && !venueId) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Sem dados do recinto.</Text>
        <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // enquanto vai buscar por id
  if (!venue && venueId) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  // a partir daqui temos 'venue'
  const title = venue?.name || "Recinto";
  const subtitle = [venue?.district, venue?.type].filter(Boolean).join(" • ");
  const imageUri =
    venue?.image ||
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop";

  const onSchedule = () => {
    navigation.navigate("Find", { venueId: venue._id, venueName: venue.name });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={{ width: "100%", height: 180, borderRadius: 12 }} />

      <View style={{ marginTop: 12 }}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="location-outline" size={16} color="black" />
            <Text style={{ marginLeft: 6 }}>{subtitle}</Text>
          </View>
        )}
      </View>

      {venue?.address ? (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Morada</Text>
          <Text>{venue.address}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={onSchedule}>
        <Text style={styles.buttonText}>Agendar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#444", marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
