import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import StatusPill from "../components/StatusPill";
import { colors, radius, spacing, typography } from "../theme";

export default function HelpScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Suporte</Text>
        <Text style={styles.title}>Ajuda</Text>
        <Text style={styles.subtitle}>Respostas curtas para demonstrar os principais fluxos da app.</Text>
      </View>

      <HelpCard
        icon="calendar-outline"
        title="Como faco uma reserva?"
        body="Escolhe um recinto, seleciona dia e hora, confirma o resumo e avanca para pagamento."
      />
      <HelpCard
        icon="card-outline"
        title="Que pagamentos sao suportados?"
        body="A app prepara Stripe PaymentSheet. Sem chaves configuradas, o pagamento fica bloqueado com uma mensagem clara."
      />
      <HelpCard
        icon="close-circle-outline"
        title="Posso cancelar uma reserva?"
        body="Sim. Vai a Eventos, abre a reserva futura e usa Cancelar. O backend aplica as regras de cancelamento."
      />

      <Card style={styles.demoCard}>
        <View style={styles.demoHeader}>
          <View style={styles.demoIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>Contacto de demo</Text>
        </View>
        <Text style={styles.body}>
          Este ecra usa contactos ficticios para a apresentacao do projeto.
        </Text>
        <StatusPill tone="primary" style={styles.pill}>suporte@sportsradar.demo</StatusPill>
      </Card>
    </ScrollView>
  );
}

function HelpCard({ icon, title, body }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={19} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>
    </Card>
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
  demoCard: {
    backgroundColor: colors.surfaceAlt,
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  pill: {
    marginTop: spacing.md,
  },
});
