import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "../styles/ProfileStyles";
import { api } from "../services/api";
import { meRequest } from "../services/auth";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await meRequest();
        if (!mounted) return;
        setName(me?.name || "");
        setEmail(me?.email || "");
      } catch (_) {
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    // validações simples
    if (!name.trim()) return Alert.alert("Atenção", "O nome não pode estar vazio.");
    if (newPassword || confirm) {
      if (newPassword.length < 6) return Alert.alert("Atenção", "Password deve ter pelo menos 6 caracteres.");
      if (newPassword !== confirm) return Alert.alert("Atenção", "As passwords não coincidem.");
    }

    try {
      setSaving(true);
      const body = { name: name.trim() };
      if (newPassword) body.password = newPassword;

      await api.patch("/auth/me", body);
      Alert.alert("Sucesso", newPassword ? "Nome e password atualizados." : "Nome atualizado.");

      // limpar campos de password depois de gravar
      setNewPassword("");
      setConfirm("");
    } catch (e) {
      Alert.alert("Erro", e?.response?.data?.msg || "Falha ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={80}
    >
      {/* Header simples */}
      <View style={styles.card}>
        <Text style={styles.title}>Perfil</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#efefef", color: "#666" }]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="O teu nome"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Alterar password (opcional)</Text>

        <Text style={styles.label}>Nova password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar password</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repete a password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "A guardar..." : "Guardar alterações"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#444" }]} onPress={logout}>
        <Text style={styles.buttonText}>Terminar sessão</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}
