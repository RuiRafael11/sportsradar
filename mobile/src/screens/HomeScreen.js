import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { api, getApiErrorMessage } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import StatusPill from "../components/StatusPill";
import VenueCard from "../components/VenueCard";
import { colors, radius, spacing, typography } from "../theme";

const ALL_SPORTS = [
  "padel",
  "tenis",
  "futsal",
  "basquetebol",
  "futebol",
  "polidesportivo",
  "pavilhao",
  "multiusos",
  "atletismo",
];

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

function labelForSport(value) {
  if (value === "all") return "Todos";
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [base, setBase] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(10000);
  const [prefSports, setPrefSports] = useState([]);

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
      if (!id) return;
      const next = favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id];
      saveFavs(next);
    },
    [favorites, saveFavs]
  );

  const readPrefs = useCallback(async () => {
    let lat = 39.5;
    let lng = -8.0;
    let r = 10000;
    let sports = [];
    try {
      const raw = await AsyncStorage.getItem("@prefs");
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.baseLat === "number" && typeof p.baseLng === "number") {
          lat = p.baseLat;
          lng = p.baseLng;
        }
        if (typeof p.radiusKm === "number") r = Math.max(1000, p.radiusKm * 1000);
        if (Array.isArray(p.sports)) sports = p.sports.map((s) => String(s).toLowerCase());
      }
    } catch {}
    setBase({ lat, lng });
    setRadius(r);
    setPrefSports(sports);
    return { lat, lng, r, sports };
  }, []);

  const fetchPlaces = useCallback(async () => {
    const { lat, lng, r, sports } = await readPrefs();
    const keywords = (chip !== "all" ? [chip] : sports.length ? sports : ALL_SPORTS).join(",");
    const { data } = await api.get("/places/search", {
      params: { lat, lng, radius: r, keywords },
    });
    const arr = Array.isArray(data) ? data : [];
    setLoadError("");

    const withDist = arr.map((it) => ({
      ...it,
      _distanceKm:
        lat && lng && it.lat && it.lng
          ? distanceKm({ lat, lng }, { lat: it.lat, lng: it.lng })
          : null,
    }));

    const googleIds = withDist.filter((v) => String(v._id).startsWith("g:")).map((v) => v._id);
    let extrasById = {};
    if (googleIds.length) {
      try {
        const { data: extras } = await api.post("/venue-extras/bulk", { placeIds: googleIds });
        extrasById = (Array.isArray(extras) ? extras : []).reduce((acc, e) => {
          if (e?.placeId && e?.details) acc[e.placeId] = e.details;
          return acc;
        }, {});
      } catch {}
    }

    const merged = withDist.map((v) => {
      const det = extrasById[v._id] || null;
      return det ? { ...v, details: det } : v;
    });

    merged.sort((a, b) => {
      const da = a._distanceKm ?? Infinity;
      const db = b._distanceKm ?? Infinity;
      return da - db;
    });

    setItems(merged);
  }, [chip, readPrefs]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await fetchPlaces();
    } catch (e) {
      setItems([]);
      setLoadError(getApiErrorMessage(e, "Nao foi possivel carregar recintos."));
    } finally {
      setLoading(false);
    }
  }, [fetchPlaces]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await AsyncStorage.getItem("@prefs_bump");
      await fetchPlaces();
    } catch (e) {
      setItems([]);
      setLoadError(getApiErrorMessage(e, "Nao foi possivel atualizar recintos."));
    } finally {
      setRefreshing(false);
    }
  }, [fetchPlaces]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        await AsyncStorage.getItem("@prefs_bump");
        if (alive) {
          try {
            await fetchPlaces();
          } catch (e) {
            setItems([]);
            setLoadError(getApiErrorMessage(e, "Nao foi possivel carregar recintos."));
          }
        }
      })();
      return () => {
        alive = false;
      };
    }, [fetchPlaces])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      if (!q) return true;
      return (
        v.name?.toLowerCase().includes(q) ||
        v.district?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const suggestions = filtered.slice(0, 6);
  const favList = filtered.filter((v) => favorites.includes(v._id));
  const radiusKm = Math.round((radius || 0) / 1000);

  const chips = useMemo(() => {
    const set = new Set(["all", ...(prefSports.length ? prefSports : ALL_SPORTS)]);
    return Array.from(set).map((key) => ({ key, label: labelForSport(key) }));
  }, [prefSports]);

  const goDetail = (venue) => {
    const id = venue?._id;
    if (!id) return;
    navigation.navigate("Find", {
      screen: "SportDetail",
      params: { venueId: id, venueName: venue?.name || "", venue },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>A procurar recintos perto de ti...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Descobrir</Text>
        <Text style={styles.title}>Recintos para reservar</Text>
        <Text style={styles.subtitle}>
          Usa as preferencias do perfil para ajustar localizacao, raio e modalidades.
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Procurar por nome, distrito ou modalidade"
            placeholderTextColor="#9A9290"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <StatusPill tone="neutral">{radiusKm || 10} km</StatusPill>
          <StatusPill tone="neutral">
            {base?.lat && base?.lng ? "Localizacao definida" : "Portugal"}
          </StatusPill>
        </View>
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {chips.map((item) => {
          const active = chip === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              onPress={() => setChip(item.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ErrorBanner message={loadError} title="Pesquisa indisponivel" style={styles.banner} />

      <SectionTitle title="Sugestoes" subtitle={`${suggestions.length} resultado(s) em destaque`} />
      {suggestions.length === 0 ? (
        <EmptyState
          compact
          icon="search-outline"
          title="Sem resultados para mostrar"
          message={
            loadError
              ? "Confirma a configuracao da API ou tenta atualizar."
              : "Experimenta limpar a pesquisa, mudar a modalidade ou ajustar as preferencias."
          }
          actionLabel="Atualizar"
          onAction={onRefresh}
          style={styles.empty}
        />
      ) : (
        suggestions.map((venue) => (
          <VenueCard
            key={venue._id}
            venue={venue}
            onPress={() => goDetail(venue)}
            favorite={favorites.includes(venue._id)}
            onFavoritePress={() => toggleFavorite(venue._id)}
          />
        ))
      )}

      <SectionTitle title="Favoritos" subtitle="Recintos guardados para acesso rapido" />
      {favList.length === 0 ? (
        <EmptyState
          compact
          icon="heart-outline"
          title="Ainda nao tens favoritos"
          message="Toca no coracao de um recinto para o guardar aqui."
          style={styles.empty}
        />
      ) : (
        favList.map((venue) => (
          <VenueCard
            key={`fav-${venue._id}`}
            compact
            venue={venue}
            onPress={() => goDetail(venue)}
            favorite
            onFavoritePress={() => toggleFavorite(venue._id)}
          />
        ))
      )}

      <SectionTitle title="Todos os resultados" subtitle={`${filtered.length} recinto(s) encontrados`} />
      {filtered.length === 0 && !loadError ? (
        <EmptyState
          compact
          icon="map-outline"
          title="Nao ha recintos nesta selecao"
          message="Revê o texto de pesquisa ou as preferencias do perfil."
          style={styles.empty}
        />
      ) : (
        filtered.map((venue) => (
          <TouchableOpacity
            key={`row-${venue._id}`}
            activeOpacity={0.86}
            onPress={() => goDetail(venue)}
            style={styles.row}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="tennisball-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={styles.rowTitle}>
                {venue.name || "Recinto"}
              </Text>
              <Text numberOfLines={1} style={styles.rowMeta}>
                {[String(venue.type || "").toLowerCase(), venue.district].filter(Boolean).join(" - ")}
                {venue._distanceKm != null ? ` - ${venue._distanceKm.toFixed(1)} km` : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))
      )}

      <Button
        title="Abrir mapa"
        icon="map-outline"
        variant="secondary"
        onPress={() => navigation.navigate("Find", { screen: "Map" })}
        style={styles.mapButton}
      />
    </ScrollView>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.subtitle,
    marginTop: spacing.md,
    textAlign: "center",
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  searchCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  searchBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chips: {
    paddingRight: spacing.lg,
    paddingBottom: spacing.md,
  },
  chip: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  banner: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  sectionSubtitle: {
    ...typography.small,
    marginTop: 2,
  },
  empty: {
    marginBottom: spacing.md,
  },
  row: {
    minHeight: 68,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "#EDC7C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15,
  },
  rowMeta: {
    ...typography.small,
    marginTop: 2,
  },
  mapButton: {
    marginTop: spacing.lg,
  },
});
