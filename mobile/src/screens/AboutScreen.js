import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import StatusPill from "../components/StatusPill";
import { colors, radius, spacing, typography } from "../theme";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Projeto</Text>
        <Text style={styles.title}>Sobre SportsRadar</Text>
        <Text style={styles.subtitle}>
          App movel para descobrir recintos desportivos, agendar reservas e preparar pagamentos.
        </Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="trophy-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Objetivo</Text>
        </View>
        <Text style={styles.body}>
          SportsRadar junta pesquisa, mapa, detalhes de recinto, agendamento, pagamento e historico num fluxo unico para uma demo universitaria.
        </Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="construct-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Estado da demo</Text>
        </View>
        <View style={styles.pills}>
          <StatusPill tone="success">Versao 1.0.0</StatusPill>
          <StatusPill tone="primary">Stripe sandbox</StatusPill>
          <StatusPill>Google Places configuravel</StatusPill>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Legal e privacidade</Text>
        </View>
        <Text style={styles.body}>
          Os termos e a politica de privacidade aparecem no registo. Este ecra evita links externos ficticios para manter a demo segura e honesta.
        </Text>
      </Card>
    </ScrollView>
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    flex: 1,
  },
  body: {
    ...typography.subtitle,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
