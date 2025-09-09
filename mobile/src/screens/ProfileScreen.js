// mobile/src/screens/ProfileScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  StyleSheet, ScrollView, ActivityIndicator
} from "react-native";
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { debounce } from "../utils/debounce";

const COLORS = {
  bg: "#F6F7F9", card: "#FFFFFF", text: "#111827", sub: "#6B7280",
  border: "#E5E7EB", primary: "#8B0000", danger: "#b91c1c",
};

const ALL_SPORTS = ["Padel","Tenis","Futsal","Basquetebol","Futebol","Polidesportivo","Pavilhao","Multiusos","Atletismo"];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // conta
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // prefs
  const [radiusKm, setRadiusKm] = useState(10);
  const [cityQuery, setCityQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [baseLat, setBaseLat] = useState(null);
  const [baseLng, setBaseLng] = useState(null);
  const [baseLabel, setBaseLabel] = useState("");
  const [sports, setSports] = useState(["Tenis","Futebol"]); // exemplo

  useEffect(() => {
    setName(user?.name || "");
  }, [user?._id]);

  // carregar @prefs
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@prefs");
        if (raw) {
          const p = JSON.parse(raw);
          if (typeof p.radiusKm === 'number') setRadiusKm(p.radiusKm);
          if (typeof p.baseLat === 'number') setBaseLat(p.baseLat);
          if (typeof p.baseLng === 'number') setBaseLng(p.baseLng);
          if (typeof p.baseLabel === 'string') { setBaseLabel(p.baseLabel); setCityQuery(p.baseLabel); }
          if (Array.isArray(p.sports)) setSports(p.sports);
        }
      } catch {}
    })();
  }, []);

  const persistPrefs = async (patch) => {
    try {
      const raw = await AsyncStorage.getItem("@prefs");
      const prev = raw ? JSON.parse(raw) : {};
      const next = { ...prev, ...patch };
      await AsyncStorage.setItem("@prefs", JSON.stringify(next));
    } catch {}
  };

  const inc = () => { const v = Math.min(100, radiusKm + 5); setRadiusKm(v); persistPrefs({ radiusKm: v }); };
  const dec = () => { const v = Math.max(1, radiusKm - 5); setRadiusKm(v); persistPrefs({ radiusKm: v }); };

  // chips
  const toggleSport = (s) => {
    const has = sports.includes(s);
    const next = has ? sports.filter(x => x !== s) : [...sports, s];
    setSports(next); persistPrefs({ sports: next });
  };

  // autocomplete cidades
  const doSuggest = useMemo(() =>
    debounce(async (q) => {
      try {
        if (!q || q.length < 2) { setSuggestions([]); return; }
        const { data } = await api.get('/geo/suggest', { params: { q } });
        setSuggestions(Array.isArray(data) ? data : []);
      } catch { setSuggestions([]); }
    }, 300), []);

  const onChangeCity = (t) => { setCityQuery(t); doSuggest(t); };

  const pickSuggestion = async (s) => {
    setCityQuery(s.description);
    setSuggestions([]);
    try {
      const { data } = await api.get('/geo/place', { params: { placeId: s.placeId } });
      setBaseLat(data.lat); setBaseLng(data.lng); setBaseLabel(data.name || s.description);
      await persistPrefs({ baseLat: data.lat, baseLng: data.lng, baseLabel: data.name || s.description });
      Alert.alert("Localização", `Base definida: ${data.name}`);
    } catch { Alert.alert("Erro", "Não foi possível obter a localização."); }
  };

  const useMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert("Permissão", "Concede acesso à localização.");
      const geo = await Location.getCurrentPositionAsync({});
      setBaseLat(geo.coords.latitude);
      setBaseLng(geo.coords.longitude);
      setBaseLabel("A minha localização");
      await persistPrefs({ baseLat: geo.coords.latitude, baseLng: geo.coords.longitude, baseLabel: "A minha localização" });
    } catch { Alert.alert("Erro", "Falha a obter localização."); }
  };

  // guardar conta (nome/password)
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} keyboardShouldPersistTaps="handled">
      {/* Conta */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Conta</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput value={name} onChangeText={setName} placeholder="O teu nome" style={styles.input} />

        <Text style={[styles.label, { marginTop: 12 }]}>Password (opcional)</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="Nova password" secureTextEntry style={styles.input} />

        <TouchableOpacity onPress={onSaveAccount} style={styles.primaryBtn} disabled={savingAccount}>
          <Text style={styles.primaryBtnText}>{savingAccount ? "A guardar..." : "Guardar"}</Text>
        </TouchableOpacity>
      </View>

      {/* Preferências */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferências</Text>

        <Text style={[styles.label, { marginTop: 10 }]}>Raio de procura</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <TouchableOpacity onPress={dec} style={styles.roundBtn}><Text style={styles.roundBtnTxt}>−</Text></TouchableOpacity>
          <Text style={{ marginHorizontal: 14, fontSize: 18, fontWeight: "700" }}>{radiusKm} km</Text>
          <TouchableOpacity onPress={inc} style={styles.roundBtn}><Text style={styles.roundBtnTxt}>+</Text></TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Cidade / Localidade</Text>
        <TextInput
          placeholder="Escreve a cidade (ex: Porto)"
          value={cityQuery}
          onChangeText={onChangeCity}
          style={styles.input}
        />
        {suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map(s => (
              <TouchableOpacity key={s.placeId} style={styles.dropItem} onPress={() => pickSuggestion(s)}>
                <Text numberOfLines={1}>{s.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {baseLat && baseLng ? (
          <Text style={{ marginTop: 8, color: COLORS.sub }}>
            Base: {baseLabel} • lat: {baseLat.toFixed(5)} • lng: {baseLng.toFixed(5)}
          </Text>
        ) : null}

        <TouchableOpacity onPress={useMyLocation} style={[styles.outlineBtn, { marginTop: 12 }]}>
          <Ionicons name="locate-outline" size={18} color={COLORS.primary} />
          <Text style={[styles.outlineBtnText, { marginLeft: 8 }]}>Usar a minha localização</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Modalidades preferidas</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
          {ALL_SPORTS.map(s => {
            const active = sports.includes(s);
            return (
              <TouchableOpacity
                key={s}
                onPress={() => toggleSport(s)}
                style={[
                  styles.chip,
                  active && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                ]}
              >
                <Text style={[styles.chipTxt, active && { color: "#fff" }]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Suporte */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Suporte</Text>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate("Help")}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />
          <Text style={styles.linkText}>Ajuda</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate("About")}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
          <Text style={styles.linkText}>Sobre</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={[styles.card, { borderColor: "#fee2e2" }]}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Terminar sessão</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, marginHorizontal: 16, marginTop: 12,
    padding: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionTitle: { fontWeight: "700", color: COLORS.text, fontSize: 18, marginBottom: 6 },
  label: { color: COLORS.sub, marginTop: 6, marginBottom: 6 },
  input: {
    height: 46, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, backgroundColor: "#fff", fontSize: 16,
  },
  primaryBtn: {
    marginTop: 14, height: 48, backgroundColor: COLORS.primary,
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  roundBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
  },
  roundBtnTxt: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: -2 },

  dropdown: {
    marginTop: 6, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: "#fff"
  },
  dropItem: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },

  outlineBtn: {
    height: 44, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", flexDirection: "row"
  },
  outlineBtnText: { color: COLORS.primary, fontWeight: "700" },

  chip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#fff",
  },
  chipTxt: { color: COLORS.text, fontWeight: "600" },

  linkRow: {
    marginTop: 4, height: 50, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  linkText: { flex: 1, marginLeft: 8, color: COLORS.text, fontSize: 16 },

  logoutBtn: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#fecaca",
    backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center",
  },
  logoutText: { color: COLORS.danger, fontWeight: "700", fontSize: 16 },
});
