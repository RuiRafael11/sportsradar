import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

const ALL_SPORTS = ["padel","tenis","futsal","basquetebol","futebol","polidesportivo","pavilhao","multiusos","atletismo"];

// haversine para ordenar por distância
const toRad = (d) => (d * Math.PI) / 180;
function distanceKm(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat || 0)) *
      Math.cos(toRad(b.lat || 0)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const [favorites, setFavorites] = useState([]);

  // prefs lidas do AsyncStorage
  const [base, setBase] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(10000);
  const [prefSports, setPrefSports] = useState([]);

  // carregar favoritos do storage
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

  const toggleFavorite = useCallback(
    (id) => {
      const next = favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id];
      saveFavs(next);
    },
    [favorites, saveFavs]
  );

  const readPrefs = async () => {
    let lat = 39.5, lng = -8.0, r = 10000, sports = [];
    try {
      const raw = await AsyncStorage.getItem("@prefs");
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.baseLat === "number" && typeof p.baseLng === "number") {
          lat = p.baseLat;
          lng = p.baseLng;
        }
        if (typeof p.radiusKm === "number") r = Math.max(1000, p.radiusKm * 1000);
        if (Array.isArray(p.sports)) sports = p.sports.map(s => String(s).toLowerCase());
      }
    } catch {}
    setBase({ lat, lng });
    setRadius(r);
    setPrefSports(sports);
    return { lat, lng, r, sports };
  };

  const fetchPlaces = async () => {
    const { lat, lng, r, sports } = await readPrefs();
    const keywords = (chip !== "all" ? [chip] : (sports.length ? sports : ALL_SPORTS)).join(",");
    const { data } = await api.get("/places/search", {
      params: { lat, lng, radius: r, keywords },
    });
    const arr = Array.isArray(data) ? data : [];
    // anexa a distância para ordenação
    const withDist = arr.map((it) => ({
      ...it,
      _distanceKm: (lat && lng && it.lat && it.lng) ? distanceKm({ lat, lng }, { lat: it.lat, lng: it.lng }) : null,
    }));
    withDist.sort((a, b) => {
      const da = a._distanceKm ?? Infinity;
      const db = b._distanceKm ?? Infinity;
      return da - db;
    });
    setItems(withDist);
  };

  const load = async () => {
    setLoading(true);
    try {
      await fetchPlaces();
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // lê um possível bump do perfil (não precisamos do valor, só força IO)
      await AsyncStorage.getItem("@prefs_bump");
      await fetchPlaces();
    } finally {
      setRefreshing(false);
    }
  }, [chip]);

  // 1) primeiro mount
  useEffect(() => {
    load();
  }, []);

  // 2) sempre que o ecrã ganha foco OU muda o chip, recarrega
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await AsyncStorage.getItem("@prefs_bump");
        if (alive) fetchPlaces();
      })();
      return () => { alive = false; };
    }, [chip])
  );

  // filtragem por texto
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      const okQuery =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.district?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q);
      return okQuery;
    });
  }, [items, query]);

  const suggestions = filtered.slice(0, 6);
  const favList = filtered.filter((v) => favorites.includes(v._id));

  const goDetail = (venue) => {
    const id = venue?._id;
    if (!id) return;
    navigation.navigate("Find", {
      screen: "SportDetail",
      params: { venueId: id, venueName: venue?.name || "", venue }, // passa o objeto Google
    });
  };

  // chips: “Todos” + modalidades (prefSports primeiro)
  const CHIPS = useMemo(() => {
    const set = new Set(["all", ...(prefSports.length ? prefSports : ALL_SPORTS)]);
    return Array.from(set).map((k) => ({ key: k, label: k === "all" ? "Todos" : k }));
  }, [prefSports]);

  const renderChip = ({ item }) => {
    const active = chip === item.key;
    return (
      <TouchableOpacity
        onPress={() => setChip(item.key)}
        style={[
          styles.chip,
          active && { backgroundColor: COLORS.chipActiveBg, borderColor: COLORS.chipActiveBg },
        ]}
      >
        <Ionicons
          name={active ? "pricetag" : "pricetag-outline"}
          size={16}
          color={active ? COLORS.chipActiveText : COLORS.text}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.chipText, active && { color: COLORS.chipActiveText }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const Card = ({ item }) => {
    const isFav = favorites.includes(item._id);
    const distanceStr =
      item._distanceKm != null ? ` • ${item._distanceKm.toFixed(1)} km` : "";
    return (
      <TouchableOpacity onPress={() => goDetail(item)} activeOpacity={0.9} style={styles.card}>
        <ImageFallback uri={getVenueImage(item)} style={styles.cardImage} />
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => toggleFavorite(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={COLORS.heart} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardMeta}>
            {(item.type || "").toLowerCase()} • {item.district}
            {distanceStr}
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

      {/* chips horizontais */}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              >
                {favList.map((v) => (
                  <TouchableOpacity key={v._id} onPress={() => goDetail(v)} activeOpacity={0.9} style={styles.favCard}>
                    <ImageFallback uri={getVenueImage(v)} style={styles.favImg} />
                    <View style={{ padding: 10 }}>
                      <Text numberOfLines={1} style={styles.favTitle}>
                        {v.name}
                      </Text>
                      <Text style={styles.favMeta}>
                        {(v.type || "").toLowerCase()} • {v.district}
                        {v._distanceKm != null ? ` • ${v._distanceKm.toFixed(1)} km` : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleFavorite(v._id)}
                      style={styles.favHeart}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={favorites.includes(v._id) ? "heart" : "heart-outline"}
                        size={20}
                        color={COLORS.heart}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* todos */}
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Todos</Text>
            <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              {filtered.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  onPress={() => goDetail(v)}
                  activeOpacity={0.8}
                  style={styles.row}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.rowIcon}>
                      <MaterialCommunityIcons
                        name="tennis-ball"
                        size={18}
                        color="#B91C1C"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.rowTitle}>
                        {v.name}
                      </Text>
                      <Text style={styles.rowMeta}>
                        {(v.type || "").toLowerCase()} • {v.district}
                        {v._distanceKm != null ? ` • ${v._distanceKm.toFixed(1)} km` : ""}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  sectionTitle: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },

  // search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 15, color: COLORS.text },

  // chip
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    backgroundColor: COLORS.chipBg,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    marginHorizontal: 4,
  },
  chipText: { fontSize: 14, color: COLORS.text },

  // card grande
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardImage: { width: "100%", height: 190 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: COLORS.text, flex: 1, marginRight: 8 },
  cardMeta: { color: COLORS.sub, marginTop: 2, marginBottom: 10 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: { color: "white", fontWeight: "700" },

  // favs
  favCard: {
    width: 280,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favImg: { width: "100%", height: 110 },
  favTitle: { fontWeight: "700", color: COLORS.text },
  favMeta: { color: COLORS.sub, marginTop: 2 },
  favHeart: { position: "absolute", right: 10, top: 10, backgroundColor: "#fff", padding: 6, borderRadius: 999 },

  // rows “Todos”
  row: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rowTitle: { fontWeight: "700", color: COLORS.text },
  rowMeta: { color: COLORS.sub, fontSize: 13, marginTop: 2 },
});
