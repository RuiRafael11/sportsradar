import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Ionicons name="help-circle-outline" size={26} color="#8B0000" />
        <Text style={{ fontSize: 22, fontWeight: "800", marginLeft: 8 }}>Ajuda</Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Como faço uma reserva?</Text>
        <Text style={{ color: "#555" }}>
          Escolhe o recinto, seleciona dia e hora disponíveis e confirma o pagamento. A reserva fica
          logo no teu histórico.
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Que métodos de pagamento são aceites?</Text>
        <Text style={{ color: "#555" }}>
          Cartões (Stripe). Opcionalmente Google Pay/Apple Pay se configurados.
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 12 }}>
        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Posso cancelar uma reserva?</Text>
        <Text style={{ color: "#555" }}>
          Sim, até 24h antes da hora marcada, na secção “Events” (Próximos).
        </Text>
      </View>

      {/* Contactos */}
      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => Linking.openURL("tel:910593202")}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                   backgroundColor: "#eee", padding: 12, borderRadius: 10, marginRight: 6 }}
        >
          <Ionicons name="call-outline" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text>910 593 202</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:supportSP@mail.com")}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                   backgroundColor: "#eee", padding: 12, borderRadius: 10, marginLeft: 6 }}
        >
          <Ionicons name="mail-outline" size={18} color="#333" style={{ marginRight: 6 }} />
          <Text>supportSP@mail.com</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
