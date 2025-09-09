// mobile/src/screens/HomeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";
import { getVenueImage, ImageFallback } from "../utils/images";

const COLORS = {
  bg: "#F4F6F8",
  card: "#FFFFFF",
  text: "#111827",
  sub: "#6B7280",
  brand: "#8B0000",
  border: "#E5E7EB",
  chipBg: "#FFFFFF",
  chipBorder: "#E5E7EB",
  chipActiveBg: "#8B0000",
  chipActiveText: "#FFFFFF",
  heart: "#8B0000",
};

const CHIPS = [
  { key: "all", label: "Todos", icon: "location" },
  { key: "campo de futebol", label: "campo de futebol", icon: "football" },
  { key: "campo de futebol/futsal", label: "campo de futebol/futsal", icon: "football" },
  { key: "futsal/basquetebol", label: "futsal/basquetebol", icon: "basketball" },
  { key: "padel", label: "padel", icon: "tennisball" },
  { key: "padel/tenis", label: "padel/tenis", icon: "tennisball" },
  { key: "tenis", label: "tenis", icon: "tennisball" },
  { key: "polidesportivo", label: "polidesportivo", icon: "medal" },
  { key: "pavilhao", label: "pavilhao", icon: "business" },
  { key: "multiusos", label: "multiusos", icon: "grid" },
  { key: "campo/atletismo", label: "campo/atletismo", icon: "speedometer" },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [venuesDb, setVenuesDb] = useState([]);     // da tua BD
  const [venuesG, setVenuesG] = useState([]);       // do Google
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const [favorites, setFavorites] = useState([]);

  // 1) carrega recintos da BD
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get("/venues");
        if (!mounted) return;
        setVenuesDb(Array.isArray(r.data) ? r.data : []);
      } catch {
        setVenuesDb([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 2) carrega recintos do Google Places (com localização do user)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setVenuesG([]);
          return;
        }
        const geo = await Location.getCurrentPositionAsync({});
        const lat = geo.coords.latitude;
        const lng = geo.coords.longitude;

        const r = await api.get("/places/search", { params: { lat, lng, radius: 10000 } }); // 10km
        setVenuesG(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.warn("places/search failed:", e.message);
        setVenuesG([]);
      }
    })();
  }, []);

  // favoritos
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@favorites");
        if (raw) setFavorites(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const saveFavs = useCallback(async (next) => {
    setFavorites(next);
    try {
      await AsyncStorage.setItem("@favorites", JSON.stringify(next));
    } catch {}
  }, []);

  const toggleFavorite = useCallback((id) => {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    saveFavs(next);
  }, [favorites, saveFavs]);

  // junta BD + Google
  const allVenues = useMemo(() => [...venuesG, ...venuesDb], [venuesG, venuesDb]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allVenues.filter((v) => {
      const okQuery =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.district?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q);
      const okChip = chip === "all" || v.type?.toLowerCase().includes(chip);
      return okQuery && okChip;
    });
  }, [allVenues, query, chip]);

  const suggestions = filtered.slice(0, 6);
  const favList = filtered.filter((v) => favorites.includes(v._id));

  const goDetail = (venue) => {
    const id = venue?._id || venue?.id;
    if (!id) {
      console.warn("Sem id do recinto:", venue);
      return;
    }
    navigation.navigate("Find", {
      screen: "SportDetail",
      params: { venueId: id, venueName: venue?.name || "", venue }, // passa o objeto (importante para Google)
    });
  };

  const renderChip = ({ item }) => {
    const active = chip === item.key;
    const iconName = item.icon;
    return (
      <TouchableOpacity
        onPress={() => setChip(item.key)}
        style={[styles.chip, active && { backgroundColor: COLORS.chipActiveBg, borderColor: COLORS.chipActiveBg }]}
      >
        <Ionicons name={iconName} size={16} color={active ? COLORS.chipActiveText : COLORS.text} style={{ marginRight: 6 }} />
        <Text style={[styles.chipText, active && { color: COLORS.chipActiveText }]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const Card = ({ item }) => {
    const isFav = favorites.includes(item._id);
    return (
      <TouchableOpacity onPress={() => goDetail(item)} activeOpacity={0.9} style={styles.card}>
        <ImageFallback source={getVenueImage(item)} style={styles.cardImage} />
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item._id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={COLORS.heart} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardMeta}>
            {String(item.type || "").toLowerCase()} • {item.district}
          </Text>
          <TouchableOpacity onPress={() => goDetail(item)} style={styles.cta}>
            <Text style={styles.ctaText}>Detalhe</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View>
      {/* search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Procurar por nome, distrito, modalidade…"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* chips */}
      <View style={{ paddingLeft: 12, marginBottom: 10 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CHIPS}
          keyExtractor={(i) => i.key}
          renderItem={renderChip}
          contentContainerStyle={{ paddingRight: 12 }}
        />
      </View>

      {/* sugestões */}
      <Text style={styles.sectionTitle}>Sugestões</Text>
      {suggestions.length === 0 && (
        <Text style={{ paddingHorizontal: 16, color: COLORS.sub, marginBottom: 8 }}>
          Sem resultados para este filtro.
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Card item={item} />}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          <View>
            {/* favoritos */}
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Favoritos</Text>
            {favList.length === 0 ? (
              <Text style={{ paddingHorizontal: 16, color: COLORS.sub, marginBottom: 8 }}>
                Ainda não tens favoritos. Toca no ❤ num cartão para guardar.
              </Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                {favList.map((v) => (
                  <TouchableOpacity key={v._id} onPress={() => goDetail(v)} activeOpacity={0.9} style={styles.favCard}>
                    <ImageFallback source={getVenueImage(v)} style={styles.favImg} />
                    <View style={{ padding: 10 }}>
                      <Text numberOfLines={1} style={styles.favTitle}>{v.name}</Text>
                      <Text style={styles.favMeta}>{String(v.type || "").toLowerCase()} • {v.district}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFavorite(v._id)} style={styles.favHeart} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name={favorites.includes(v._id) ? "heart" : "heart-outline"} size={20} color={COLORS.heart} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* todos */}
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Todos</Text>
            <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              {filtered.map((v) => (
                <TouchableOpacity key={v._id} onPress={() => goDetail(v)} activeOpacity={0.8} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={styles.rowIcon}>
                      <MaterialCommunityIcons name="tennis-ball" size={18} color="#B91C1C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.rowTitle}>{v.name}</Text>
                      <Text style={styles.rowMeta}>{String(v.type || "").toLowerCase()} • {v.district}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  sectionTitle: { paddingHorizontal: 16, marginTop: 6, marginBottom: 8, fontSize: 24, fontWeight: "800", color: COLORS.text },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 15, color: COLORS.text },

  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 38, borderRadius: 20, backgroundColor: COLORS.chipBg, borderWidth: 1, borderColor: COLORS.chipBorder, marginHorizontal: 4 },
  chipText: { fontSize: 14, color: COLORS.text },

  card: { backgroundColor: COLORS.card, marginHorizontal: 16, marginBottom: 14, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  cardImage: { width: "100%", height: 190 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, flex: 1, marginRight: 8 },
  cardMeta: { color: COLORS.sub, marginTop: 2, marginBottom: 10 },
  cta: { alignSelf: "flex-start", backgroundColor: COLORS.brand, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  ctaText: { color: "white", fontWeight: "700" },

  favCard: { width: 280, backgroundColor: COLORS.card, borderRadius: 16, overflow: "hidden", marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  favImg: { width: "100%", height: 110 },
  favTitle: { fontWeight: "700", color: COLORS.text },
  favMeta: { color: COLORS.sub, marginTop: 2 },
  favHeart: { position: "absolute", right: 10, top: 10, backgroundColor: "#fff", padding: 6, borderRadius: 999 },

  row: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginRight: 10, borderWidth: 1, borderColor: "#FECACA" },
  rowTitle: { fontWeight: "700", color: COLORS.text },
  rowMeta: { color: COLORS.sub, fontSize: 13, marginTop: 2 },
});
