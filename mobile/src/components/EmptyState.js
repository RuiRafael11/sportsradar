import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import Button from "./Button";

export default function EmptyState({
  icon = "search-outline",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  style,
}) {
  return (
    <View style={[styles.wrap, compact && styles.compact, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  compact: {
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.sectionTitle,
    textAlign: "center",
  },
  message: {
    ...typography.subtitle,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  action: {
    marginTop: spacing.lg,
    alignSelf: "stretch",
  },
});
