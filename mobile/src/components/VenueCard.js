import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "./Card";
import StatusPill from "./StatusPill";
import { colors, radius, spacing, typography } from "../theme";
import { getVenueImage, ImageFallback } from "../utils/images";

export default function VenueCard({
  venue,
  onPress,
  onFavoritePress,
  favorite = false,
  compact = false,
}) {
  const distance =
    venue?._distanceKm != null ? ` - ${Number(venue._distanceKm).toFixed(1)} km` : "";
  const meta = [String(venue?.type || "").toLowerCase(), venue?.district]
    .filter(Boolean)
    .join(" - ");

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.touchable}>
      <Card style={[styles.card, compact && styles.compactCard]}>
        {!compact ? (
          <ImageFallback uri={getVenueImage(venue)} style={styles.image} />
        ) : null}
        <View style={styles.body}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text numberOfLines={compact ? 1 : 2} style={styles.title}>
                {venue?.name || "Recinto"}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {meta || "Recinto desportivo"}{distance}
              </Text>
            </View>
            {onFavoritePress ? (
              <TouchableOpacity
                onPress={onFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.iconButton}
              >
                <Ionicons
                  name={favorite ? "heart" : "heart-outline"}
                  size={21}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {!compact ? (
            <View style={styles.footer}>
              <StatusPill tone="primary">Ver detalhes</StatusPill>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.md,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  compactCard: {
    padding: spacing.md,
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: colors.primarySoft,
  },
  body: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  meta: {
    ...typography.small,
    marginTop: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
