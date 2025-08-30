import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";

// tenta extrair {lat, lng} de várias formas comuns
function extractLatLng(v) {
  // 1) location: { lat, lng }
  if (v?.location?.lat && v?.location?.lng) {
    return { lat: Number(v.location.lat), lng: Number(v.location.lng) };
  }
  // 2) GeoJSON: location: { type:'Point', coordinates: [lng, lat] }
  if (
    v?.location?.coordinates &&
    Array.isArray(v.location.coordinates) &&
    v.location.coordinates.length === 2
  ) {
    const [lng, lat] = v.location.coordinates.map(Number);
    if (isFinite(lat) && isFinite(lng)) return { lat, lng };
  }
  // 3) geometry: { coordinates: [lng, lat] }
  if (
    v?.geometry?.coordinates &&
    Array.isArray(v.geometry.coordinates) &&
    v.geometry.coordinates.length === 2
  ) {
    const [lng, lat] = v.geometry.coordinates.map(Number);
    if (isFinite(lat) && isFinite(lng)) return { lat, lng };
  }
  // 4) top-level: { lat, lng } ou { latitude, longitude }
  if (v?.lat && v?.lng) return { lat: Number(v.lat), lng: Number(v.lng) };
  if (v?.latitude && v?.longitude)
    return { lat: Number(v.latitude), lng: Number(v.longitude) };
  // 5) coords: { lat, lng }
  if (v?.coords?.lat && v?.coords?.lng)
    return { lat: Number(v.coords.lat), lng: Number(v.coords.lng) };

  return null;
}

export default function MapComponent() {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [venues, setVenues] = useState([]);
  const [points, setPoints] = useState([]); // venues com lat/lng resolvidos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/venues");
        const arr = Array.isArray(data) ? data : [];
        const withCoords = arr
          .map((v) => {
            const ll = extractLatLng(v);
            return ll ? { ...v, __latlng: ll } : null;
          })
          .filter(Boolean);
        if (mounted) {
          setVenues(arr);
          setPoints(withCoords);
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Erro", "Não foi possível carregar os recintos.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fallbackRegion = useMemo(
    () => ({
      latitude: 38.736946, // Lisboa
      longitude: -9.142685,
      latitudeDelta: 0.6,
      longitudeDelta: 0.6,
    }),
    []
  );

  // fit automático quando existirem pontos
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;
    const coords = points.map((p) => ({
      latitude: p.__latlng.lat,
      longitude: p.__latlng.lng,
    }));
    requestAnimationFrame(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 40, bottom: 160, left: 40 },
        animated: true,
      });
    });
  }, [points]);

  const recenterAll = () => {
    if (points.length === 0) return;
    const coords = points.map((p) => ({
      latitude: p.__latlng.lat,
      longitude: p.__latlng.lng,
    }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 160, left: 40 },
      animated: true,
    });
  };

  const focusVenue = (p) => {
    if (!p?.__latlng) return;
    mapRef.current?.animateToRegion(
      {
        latitude: p.__latlng.lat,
        longitude: p.__latlng.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      350
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  if (points.length === 0) {
    // mostra quantos venues vieram e exemplo da estrutura (para debug rápido)
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Sem recintos no mapa</Text>
        <Text style={styles.emptySub}>
          Recebidos: {venues.length}. Nenhum com lat/lng reconhecível.
        </Text>
        <Text style={styles.hint}>
          Esperado: location.lat/lng, ou location.coordinates [lng, lat], ou
          latitude/longitude.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={fallbackRegion}>
        {points.map((p) => (
          <Marker
            key={p._id}
            coordinate={{
              latitude: p.__latlng.lat,
              longitude: p.__latlng.lng,
            }}
            title={p.name}
            description={[p.district, p.type].filter(Boolean).join(" • ")}
          >
            <Callout
              onPress={() =>
                navigation.navigate("SportDetail", {
                  venueId: p._id,
                  venue: p,
                })
              }
            >
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: "700" }}>{p.name}</Text>
                <Text style={{ color: "#555", marginTop: 2 }}>
                  {[p.district, p.type].filter(Boolean).join(" • ")}
                </Text>
                <Text style={{ color: "#8B0000", marginTop: 6 }}>
                  Tocar para ver detalhe →
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.fab} onPress={recenterAll}>
        <Text style={styles.fabTxt}>Recentrar</Text>
      </TouchableOpacity>

      <View style={styles.chipsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          {points.map((p) => (
            <TouchableOpacity key={p._id} style={styles.chip} onPress={() => focusVenue(p)}>
              <Text style={styles.chipTxt} numberOfLines={1}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 96,
    backgroundColor: "#8B0000",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  fabTxt: { color: "#fff", fontWeight: "700" },
  chipsWrap: {
    position: "absolute",
    left: 0,
      right: 0,
    bottom: 24,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  chipTxt: { maxWidth: 180, fontWeight: "600" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  emptySub: { color: "#555", textAlign: "center", marginBottom: 8 },
  hint: { color: "#777", fontSize: 12, textAlign: "center" },
});
