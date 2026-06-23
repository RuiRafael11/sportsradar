import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { api, getApiErrorMessage } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import StatusPill from "../components/StatusPill";
import { getVenueImage, ImageFallback } from "../utils/images";
import { colors, radius, spacing, typography } from "../theme";

export default function SportDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const passedVenue = route?.params?.venue || null;
  const venueId =
    route?.params?.venueId ||
    route?.params?.id ||
    route?.params?._id ||
    passedVenue?._id ||
    null;

  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(passedVenue);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!venueId) throw new Error("ID do recinto em falta.");

        if (!String(venueId).startsWith("g:")) {
          const r = await api.get(`/venues/${venueId}`);
          if (!mounted) return;
          setVenue(r.data);
          setLoading(false);
          return;
        }

        const base = passedVenue || { _id: venueId };
        const extra = await api
          .get(`/venue-extras/${encodeURIComponent(venueId)}`)
          .then((r) => r.data)
          .catch(() => null);

        const merged = extra?.details ? { ...base, details: extra.details } : base;
        if (!mounted) return;
        setVenue(merged);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        setError(getApiErrorMessage(e, e.message || "Recinto nao encontrado."));
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [venueId, passedVenue]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>A carregar detalhes do recinto...</Text>
      </View>
    );
  }

  if (!venue || error) {
    return (
      <View style={styles.centered}>
        <EmptyState
          icon="alert-circle-outline"
          title="Recinto indisponivel"
          message={error || "Nao foi possivel encontrar este recinto."}
          actionLabel="Voltar"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const d = venue.details || {};
  const amenities = [
    { key: "hasLockerRoom", label: "Balnearios", icon: "shirt-outline", value: d.hasLockerRoom },
    { key: "hasShowers", label: "Duches", icon: "water-outline", value: d.hasShowers },
    { key: "hasLighting", label: "Iluminacao", icon: "bulb-outline", value: d.hasLighting },
    { key: "covered", label: "Coberto", icon: "umbrella-outline", value: d.covered },
    { key: "indoor", label: "Interior", icon: "home-outline", value: d.indoor },
    { key: "parking", label: "Estacionamento", icon: "car-outline", value: d.parking },
    { key: "equipmentRental", label: "Aluguer", icon: "pricetag-outline", value: d.equipmentRental },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ImageFallback uri={getVenueImage(venue)} style={styles.heroImage} />

      <View style={styles.header}>
        <Text style={styles.title}>{venue.name || "Recinto"}</Text>
        <View style={styles.pills}>
          {venue.type ? <StatusPill tone="primary">{String(venue.type).toLowerCase()}</StatusPill> : null}
          {venue.district ? <StatusPill>{venue.district}</StatusPill> : null}
        </View>
      </View>

      <Card style={styles.card}>
        <InfoRow
          icon="location-outline"
          title="Localizacao"
          value={venue.address || venue.district || "Localizacao nao indicada"}
        />
        <InfoRow
          icon="time-outline"
          title="Horario"
          value={d.openingHours || "Horario nao indicado"}
        />
        <InfoRow
          icon="cash-outline"
          title="Preco por hora"
          value={d.pricePerHour != null ? `${Number(d.pricePerHour).toFixed(2)} EUR` : "Preco a confirmar"}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Comodidades</Text>
        <View style={styles.amenities}>
          {amenities.map((a) => (
            <View key={a.key} style={[styles.amenity, a.value && styles.amenityActive]}>
              <Ionicons
                name={a.icon}
                size={17}
                color={a.value ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.amenityText, a.value && styles.amenityTextActive]}>
                {a.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Detalhes tecnicos</Text>
        <DetailLine label="Piso" value={d.surface || "Nao indicado"} />
        <DetailLine
          label="Dimensoes"
          value={`${d.lengthMeters ? `${d.lengthMeters}m` : "-"} x ${
            d.widthMeters ? `${d.widthMeters}m` : "-"
          }`}
        />
        <DetailLine
          label="Contacto"
          value={d?.contact?.phone || d?.contact?.email || d?.contact?.website || "Nao indicado"}
        />
      </Card>

      <Button
        title="Agendar reserva"
        icon="calendar-outline"
        onPress={() =>
          navigation.navigate("ScheduleEvent", {
            venueId,
            venueName: venue.name,
            venue,
          })
        }
        style={styles.cta}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, title, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function DetailLine({ label, value }) {
  return (
    <View style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.subtitle,
    marginTop: spacing.md,
    textAlign: "center",
  },
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: colors.primarySoft,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.screenTitle,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "#EDC7C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: "800",
  },
  infoValue: {
    ...typography.body,
    marginTop: 2,
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  amenity: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  amenityActive: {
    borderColor: "#EDC7C7",
    backgroundColor: colors.primarySoft,
  },
  amenityText: {
    color: colors.textMuted,
    fontWeight: "700",
    marginLeft: spacing.xs,
  },
  amenityTextActive: {
    color: colors.text,
  },
  detailLine: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    ...typography.small,
    fontWeight: "800",
  },
  detailValue: {
    ...typography.body,
    marginTop: 2,
  },
  cta: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
