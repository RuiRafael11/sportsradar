import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/HomeStyles";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";

// ícone por modalidade
const typeIcon = (type = "") => {
  const t = (type || "").toLowerCase();
  if (t.includes("padel") || t.includes("ténis") || t.includes("tenis")) return "tennisball";
  if (t.includes("futebol") || t.includes("futsal")) return "football";
  if (t.includes("natação")) return "water";
  if (t.includes("ginásio") || t.includes("ginasio")) return "barbell";
  if (t.includes("basquet")) return "basketball";
  if (t.includes("pavilh")) return "business";
  if (t.includes("atlet")) return "walk";
  return "location";
};

// imagem “tipo” para o cartão
const typeImage = (type = "") => {
  const t = (type || "").toLowerCase();
  if (t.includes("padel")) return "https://images.unsplash.com/photo-1617957743099-1f716b795b77?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("futebol")) return "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("tenis")) return "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("pavilh")) return "https://images.unsplash.com/photo-1502810190503-8303352d0c69?q=80&w=1600&auto=format&fit=crop";
  if (t.includes("basquet")) return "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1571731956672-ac8c9a859b1a?q=80&w=1600&auto=format&fit=crop";
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [venues, setVenues] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [favIds, setFavIds] = useState([]);

  // carregar venues
  useEffect(() => {
    let mounted = true;
    api
      .get("/venues")
      .then((r) => mounted && setVenues(r.data || []))
      .catch(() => mounted && setVenues([]));
    return () => {
      mounted = false;
    };
  }, []);

  // carregar favoritos
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("fav_venues");
        setFavIds(raw ? JSON.parse(raw) : []);
      } catch (_) {}
    })();
  }, []);

  const toggleFav = async (id) => {
    const next = favIds.includes(id) ? favIds.filter((x) => x !== id) : [...favIds, id];
    setFavIds(next);
    await AsyncStorage.setItem("fav_venues", JSON.stringify(next));
  };

  const types = useMemo(() => {
    const set = new Set();
    (venues || []).forEach((v) => v?.type && set.add(v.type));
    // ordena para ficar estável
    return ["Todos", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [venues]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (venues || []).filter((v) => {
      const byType = typeFilter === "Todos" || v.type === typeFilter;
      const text = `${v.name || ""} ${v.district || ""} ${v.type || ""}`.toLowerCase();
      const bySearch = !q || text.includes(q);
      return byType && bySearch;
    });
  }, [venues, search, typeFilter]);

  const suggestions = filtered.slice(0, 6);

  if (venues === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar por nome, distrito, modalidade…"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Chips (scroll horizontal) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {types.map((t) => {
          const active = t === typeFilter;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[styles.chip, { marginRight: 8 }, active && styles.chipActive]}
            >
              <Ionicons
                name={typeIcon(t)}
                size={16}
                color={active ? "#fff" : "#333"}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sugestões */}
        <Text style={styles.sectionTitle}>Sugestões</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions.length === 0 ? (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: "#666" }}>Sem resultados para o filtro atual.</Text>
            </View>
          ) : (
            suggestions.map((v) => (
              <View key={v._id} style={styles.cardSmall}>
                <Image
                  source={{ uri: typeImage(v.type) }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  <Ionicons name={typeIcon(v.type)} size={18} color="#8B0000" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardSmallName} numberOfLines={1}>{v.name}</Text>
                    <Text style={styles.cardSmallMeta} numberOfLines={1}>
                      {[v.type, v.district].filter(Boolean).join(" • ")}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardSmallActions}>
                  <TouchableOpacity
                    style={styles.pillBtn}
                    onPress={() =>
                      navigation.navigate("Find", {
                        screen: "SportDetail",
                        params: { venueId: v._id, venue: v },
                      })
                    }
                  >
                    <Text style={styles.pillBtnTxt}>Detalhe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleFav(v._id)}>
                    <Ionicons
                      name={favIds.includes(v._id) ? "heart" : "heart-outline"}
                      size={22}
                      color={favIds.includes(v._id) ? "#8B0000" : "#444"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Favoritos */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Favoritos</Text>
        {favIds.length === 0 ? (
          <Text style={{ color: "#666", marginBottom: 12 }}>
            Ainda não tens favoritos. Toca no ♥ num cartão para guardar.
          </Text>
        ) : (
          (venues || [])
            .filter((v) => favIds.includes(v._id))
            .map((v) => (
              <TouchableOpacity
                key={v._id}
                style={styles.cardLarge}
                onPress={() =>
                  navigation.navigate("Find", {
                    screen: "SportDetail",
                    params: { venueId: v._id, venue: v },
                  })
                }
              >
                <Ionicons
                  name={typeIcon(v.type)}
                  size={18}
                  color="#8B0000"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLargeTitle} numberOfLines={1}>{v.name}</Text>
                  <Text style={styles.cardLargeMeta} numberOfLines={1}>
                    {[v.type, v.district].filter(Boolean).join(" • ")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleFav(v._id)}>
                  <Ionicons name="heart" size={22} color="#8B0000" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
        )}

        {/* Lista (Todos) */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Todos</Text>
        {filtered.map((v) => (
          <TouchableOpacity
            key={v._id}
            style={styles.row}
            onPress={() =>
              navigation.navigate("Find", {
                screen: "SportDetail",
                params: { venueId: v._id, venue: v },
              })
            }
          >
            <Ionicons name={typeIcon(v.type)} size={18} color="#8B0000" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{v.name}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {[v.type, v.district].filter(Boolean).join(" • ")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
