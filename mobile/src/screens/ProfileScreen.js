// mobile/src/screens/ProfileScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { debounce } from "../utils/debounce";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import StatusPill from "../components/StatusPill";
import { colors, radius, spacing, typography } from "../theme";

const ALL_SPORTS = [
  "Padel",
  "Tenis",
  "Futsal",
  "Basquetebol",
  "Futebol",
  "Polidesportivo",
  "Pavilhao",
  "Multiusos",
  "Atletismo",
];
const norm = (s) => String(s || "").toLowerCase();

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [radiusKm, setRadiusKm] = useState(10);
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [baseLat, setBaseLat] = useState(null);
  const [baseLng, setBaseLng] = useState(null);
  const [baseLabel, setBaseLabel] = useState("");
  const [sports, setSports] = useState(["Tenis", "Futebol"]);

  useEffect(() => {
    setName(user?.name || "");
  }, [user?._id, user?.name]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@prefs");
        if (raw) {
          const p = JSON.parse(raw);
          if (typeof p.radiusKm === "number") setRadiusKm(p.radiusKm);
          if (typeof p.baseLat === "number") setBaseLat(p.baseLat);
          if (typeof p.baseLng === "number") setBaseLng(p.baseLng);
          if (typeof p.baseLabel === "string") {
            setBaseLabel(p.baseLabel);
            setCityQuery(p.baseLabel);
          }
          if (Array.isArray(p.sports)) setSports(p.sports);
        }
      } catch {}
    })();
  }, []);

  const persistPrefsLocal = async (patch) => {
    const raw = await AsyncStorage.getItem("@prefs");
    const prev = raw ? JSON.parse(raw) : {};
    const next = { ...prev, ...patch };
    await AsyncStorage.setItem("@prefs", JSON.stringify(next));
    await AsyncStorage.setItem("@prefs_bump", Date.now().toString());
  };

  const updateRadius = (nextValue) => {
    const v = Math.min(100, Math.max(1, nextValue));
    setRadiusKm(v);
    persistPrefsLocal({ radiusKm: v }).catch(() => {});
  };

  const toggleSport = (sport) => {
    const has = sports.includes(sport);
    const next = has ? sports.filter((x) => x !== sport) : [...sports, sport];
    setSports(next);
    persistPrefsLocal({ sports: next }).catch(() => {});
  };

  const doSuggest = useMemo(
    () =>
      debounce(async (q) => {
        try {
          if (!q || q.length < 2) {
            setSuggestions([]);
            return;
          }
          const { data } = await api.get("/geo/suggest", { params: { q } });
          setSuggestions(Array.isArray(data) ? data : []);
        } catch {
          setSuggestions([]);
        }
      }, 300),
    []
  );

  const onChangeCity = async (text) => {
    setCityQuery(text);
    if (!text || !text.trim()) {
      setBaseLat(null);
      setBaseLng(null);
      setBaseLabel("");
      try {
        await persistPrefsLocal({ baseLat: null, baseLng: null, baseLabel: "" });
      } catch {}
      setSuggestions([]);
      return;
    }
    doSuggest(text);
  };

  const pickSuggestion = async (suggestion) => {
    setCityQuery(suggestion.description);
    setSuggestions([]);
    try {
      const { data } = await api.get("/geo/place", { params: { placeId: suggestion.placeId } });
      setBaseLat(data.lat);
      setBaseLng(data.lng);
      setBaseLabel(data.name || suggestion.description);
      await persistPrefsLocal({
        baseLat: data.lat,
        baseLng: data.lng,
        baseLabel: data.name || suggestion.description,
      });
      Alert.alert("Localizacao", `Base definida: ${data.name || suggestion.description}`);
    } catch {
      Alert.alert("Erro", "Nao foi possivel obter a localizacao.");
    }
  };

  const useMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissao", "Concede acesso a localizacao para usar esta opcao.");
        return;
      }
      const geo = await Location.getCurrentPositionAsync({});
      const lat = geo.coords.latitude;
      const lng = geo.coords.longitude;
      setBaseLat(lat);
      setBaseLng(lng);
      setBaseLabel("A minha localizacao");
      setCityQuery("A minha localizacao");
      await persistPrefsLocal({ baseLat: lat, baseLng: lng, baseLabel: "A minha localizacao" });
      Alert.alert("Localizacao", "Vamos usar a tua localizacao atual.");
    } catch {
      Alert.alert("Erro", "Falha ao obter localizacao.");
    }
  };

  const onSaveAccount = async () => {
    if (!name.trim() && !password.trim()) {
      Alert.alert("Nada para guardar", "Preenche o nome ou uma nova password.");
      return;
    }
    try {
      setSavingAccount(true);
      const payload = {};
      if (name.trim()) payload.name = name.trim();
      if (password.trim()) payload.password = password.trim();
      await api.patch("/auth/me", payload);
      setPassword("");
      Alert.alert("Perfil", "Perfil atualizado com sucesso.");
    } catch (e) {
      Alert.alert("Erro", e?.response?.data?.msg || "Falha ao atualizar perfil.");
    } finally {
      setSavingAccount(false);
    }
  };

  const onSavePrefs = async () => {
    try {
      setSavingPrefs(true);
      const prefsPayload = {
        radiusMeters: Math.max(1000, radiusKm * 1000),
        sports: sports.map(norm),
        homeLocation:
          Number.isFinite(baseLat) && Number.isFinite(baseLng)
            ? { lat: baseLat, lng: baseLng }
            : undefined,
      };
      await api.patch("/auth/me", { preferences: prefsPayload });
      await persistPrefsLocal({ radiusKm, baseLat, baseLng, baseLabel, sports });
      Alert.alert("Preferencias", "Preferencias guardadas.");
    } catch (e) {
      Alert.alert("Erro", e?.response?.data?.msg || "Falha ao guardar preferencias.");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Perfil</Text>
        <Text style={styles.title}>{user?.name || "A tua conta"}</Text>
        <Text style={styles.subtitle}>{user?.email || "Gere conta, preferencias e suporte."}</Text>
      </View>

      <Card style={styles.card}>
        <SectionHeader icon="person-outline" title="Conta" />
        <InputField label="Nome" value={name} onChangeText={setName} placeholder="O teu nome" icon="person-outline" />
        <InputField
          label="Password nova"
          value={password}
          onChangeText={setPassword}
          placeholder="Deixa vazio para manter"
          secureTextEntry
          icon="lock-closed-outline"
        />
        <Button
          title="Guardar conta"
          icon="save-outline"
          onPress={onSaveAccount}
          loading={savingAccount}
        />
      </Card>

      <Card style={styles.card}>
        <SectionHeader icon="options-outline" title="Preferencias de pesquisa" />
        <Text style={styles.label}>Raio de procura</Text>
        <View style={styles.radiusRow}>
          <TouchableOpacity onPress={() => updateRadius(radiusKm - 5)} style={styles.roundButton}>
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.radiusValue}>
            <Text style={styles.radiusNumber}>{radiusKm} km</Text>
            <Text style={styles.radiusHint}>Usado no Home e no mapa</Text>
          </View>
          <TouchableOpacity onPress={() => updateRadius(radiusKm + 5)} style={styles.roundButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <InputField
          label="Cidade ou localidade"
          placeholder="Ex: Porto"
          value={cityQuery}
          onChangeText={onChangeCity}
          icon="location-outline"
          containerStyle={styles.cityInput}
        />
        {suggestions.length > 0 ? (
          <View style={styles.dropdown}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.placeId}
                style={styles.dropItem}
                onPress={() => pickSuggestion(suggestion)}
              >
                <Text numberOfLines={1} style={styles.dropText}>{suggestion.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {Number.isFinite(baseLat) && Number.isFinite(baseLng) ? (
          <StatusPill tone="primary" style={styles.locationPill}>
            Base: {baseLabel || "Localizacao definida"}
          </StatusPill>
        ) : (
          <StatusPill style={styles.locationPill}>Sem base definida</StatusPill>
        )}

        <Button
          title="Usar a minha localizacao"
          icon="locate-outline"
          variant="secondary"
          onPress={useMyLocation}
          style={styles.locationButton}
        />

        <Text style={styles.label}>Modalidades preferidas</Text>
        <View style={styles.sportsWrap}>
          {ALL_SPORTS.map((sport) => {
            const active = sports.includes(sport);
            return (
              <TouchableOpacity
                key={sport}
                onPress={() => toggleSport(sport)}
                activeOpacity={0.84}
                style={[styles.sportChip, active && styles.sportChipActive]}
              >
                <Text style={[styles.sportText, active && styles.sportTextActive]}>{sport}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Guardar preferencias"
          icon="save-outline"
          onPress={onSavePrefs}
          loading={savingPrefs}
          style={styles.savePrefs}
        />
      </Card>

      <Card style={styles.card}>
        <SectionHeader icon="help-circle-outline" title="Suporte e projeto" />
        <NavRow icon="help-circle-outline" title="Ajuda" onPress={() => navigation.navigate("Help")} />
        <NavRow icon="information-circle-outline" title="Sobre SportsRadar" onPress={() => navigation.navigate("About")} />
      </Card>

      <Card style={styles.logoutCard}>
        <Button title="Terminar sessao" icon="log-out-outline" variant="danger" onPress={logout} />
      </Card>
    </ScrollView>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function NavRow({ icon, title, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} style={styles.navRow}>
      <Ionicons name={icon} size={21} color={colors.primary} />
      <Text style={styles.navText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
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
  card: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  label: {
    ...typography.small,
    color: colors.text,
    fontWeight: "800",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  radiusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusValue: {
    flex: 1,
    alignItems: "center",
  },
  radiusNumber: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  radiusHint: {
    ...typography.small,
  },
  cityInput: {
    marginBottom: spacing.xs,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  dropItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dropText: {
    color: colors.text,
  },
  locationPill: {
    marginTop: spacing.sm,
  },
  locationButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sportsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  sportChip: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
  },
  sportTextActive: {
    color: "#FFFFFF",
  },
  savePrefs: {
    marginTop: spacing.lg,
  },
  navRow: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  navText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: spacing.sm,
  },
  logoutCard: {
    borderColor: "#F4B9B4",
  },
});
