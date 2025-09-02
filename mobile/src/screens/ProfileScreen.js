import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import styles from "../styles/ProfileStyles";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");

  const onSave = async () => {
    try {
      const body = {};
      if (name && name !== user?.name) body.name = name;
      if (password) body.password = password;
      if (!Object.keys(body).length) return Alert.alert("Nada para atualizar");
      await api.patch("/auth/me", body);
      Alert.alert("Perfil atualizado");
    } catch (e) {
      Alert.alert("Erro", e?.response?.data?.msg || e.message);
    }
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"800", marginBottom:16 }}>Perfil</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="O teu nome" />

      <Text style={styles.label}>Password (opcional)</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nova password" secureTextEntry />

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveTxt}>Guardar</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("Help")}>
        <Ionicons name="help-circle-outline" size={20} color="#8B0000" style={{ marginRight: 8 }} />
        <Text style={styles.rowTxt}>Ajuda</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("About")}>
        <Ionicons name="information-circle-outline" size={20} color="#8B0000" style={{ marginRight: 8 }} />
        <Text style={styles.rowTxt}>Sobre</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#eee", borderWidth:1, borderColor:"#ddd" }]}
        onPress={logout}
      >
        <Text style={[styles.saveTxt, { color:"#a00" }]}>Terminar sessão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
