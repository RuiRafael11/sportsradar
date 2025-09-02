// mobile/src/screens/HomeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";

// --- Paleta
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

// --- Imagens por tipo (fallback)
const IMAGE_BY_TYPE = {
  padel:
    "https://images.unsplash.com/photo-1605647533135-77b1f0228f6b?q=80&w=1600&auto=format&fit=crop",
  "padel/tenis":
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop",
  tenis:
    "https://images.unsplash.com/photo-1542482378-6c2a0d167c68?q=80&w=1600&auto=format&fit=crop",
  "campo de futebol":
    "https://images.unsplash.com/photo-1543326727-cf6c39f0f1f4?q=80&w=1600&auto=format&fit=crop",
  "campo de futebol/futsal":
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
  futsal:
    "https://images.unsplash.com/photo-1593349481046-d8c1dc9d4641?q=80&w=1600&auto=format&fit=crop",
  "futsal/basquetebol":
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
  basquetebol:
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1600&auto=format&fit=crop",
  pavilhao:
    "https://images.unsplash.com/photo-1517646287270-cf3f147f1cf4?q=80&w=1600&auto=format&fit=crop",
  polidesportivo:
    "https://images.unsplash.com/photo-1521417531557-69b4e1857c3b?q=80&w=1600&auto=format&fit=crop",
  multiusos:
    "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=1600&auto=format&fit=crop",
  "campo/atletismo":
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
};

function getVenueImage(venue) {
  // se o backend já devolver "imageUrl", usa
  if (venue?.imageUrl) return venue.imageUrl;
  // senão tenta por tipo (case-insensitive)
  const t = String(venue?.type || "")
    .toLowerCase()
    .trim();
  // procurar chave que “inclua” o tipo
  const key =
    Object.keys(IMAGE_BY_TYPE).find((k) => t.includes(k)) ||
    Object.keys(IMAGE_BY_TYPE).find((k) => k.includes(t));
  return IMAGE_BY_TYPE[key] || IMAGE_BY_TYPE["polidesportivo"];
}

// chips de categorias
const CHIPS = [
  { key: "all", label: "Todos", icon: "location" },
  { key: "campo de futebol", label: "campo de futebol", icon: "football" },
  { key: "campo de futebol/futsal", label: "campo de futebol/futsal", icon: "soccer" },
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
  const [venues, setVenues] = useState([]);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const [favorites, setFavorites] = useState([]);

  // carregar recintos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get("/venues");
        if (!mounted) return;
        setVenues(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter((v) => {
      const okQuery =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.district?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q);
      const okChip = chip === "all" || v.type?.toLowerCase().includes(chip);
      return okQuery && okChip;
    });
  }, [venues, query, chip]);

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
    params: { venueId: id, venueName: venue?.name || "", venue }, // ← passa o objeto todo
  });
};
  const renderChip = ({ item }) => {
    const active = chip === item.key;
    const iconName = item.icon;
    return (
      <TouchableOpacity
        onPress={() => setChip(item.key)}
        style={[
          styles.chip,
          active && { backgroundColor: COLORS.chipActiveBg, borderColor: COLORS.chipActiveBg },
        ]}
      >
        <Ionicons
          name={iconName}
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
    const img = getVenueImage(item);
    const isFav = favorites.includes(item._id);
    return (
      <TouchableOpacity onPress={() => goDetail(item)} activeOpacity={0.9} style={styles.card}>
        <Image source={{ uri: img }} style={styles.cardImage} />
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => toggleFavorite(item._id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={COLORS.heart} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardMeta}>
            {item.type?.toLowerCase()} • {item.district}
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

      {/* chips horizontais (altura fixa média) */}
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
                    <Image source={{ uri: getVenueImage(v) }} style={styles.favImg} />
                    <View style={{ padding: 10 }}>
                      <Text numberOfLines={1} style={styles.favTitle}>
                        {v.name}
                      </Text>
                      <Text style={styles.favMeta}>
                        {v.type?.toLowerCase()} • {v.district}
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
                        {v.type?.toLowerCase()} • {v.district}
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

  // chips
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 38, // altura média e consistente
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
