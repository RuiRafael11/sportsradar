import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Ionicons name="information-circle-outline" size={26} color="#8B0000" />
        <Text style={{ fontSize: 22, fontWeight: "800", marginLeft: 8 }}>Sobre</Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Sobre a aplicação</Text>
        <Text style={{ color: "#555" }}>
          A SportRadar facilita o acesso a recintos desportivos, permitindo pesquisar, ver detalhes,
          agendar horários e pagar de forma simples e segura. Focada em usabilidade, integra métodos
          de pagamento e histórico de reservas para uma experiência completa.
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700" }}>Versão: 1.0.0</Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Termos & Políticas</Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://example.com/privacy")}>
          <Text style={{ color: "#1e88e5" }}>Política de Privacidade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL("https://example.com/terms")} style={{ marginTop: 6 }}>
          <Text style={{ color: "#1e88e5" }}>Termos de Utilização</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
