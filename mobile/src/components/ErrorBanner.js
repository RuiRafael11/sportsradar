import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";

export default function ErrorBanner({ message, title = "Algo correu mal", style }) {
  if (!message) return null;

  return (
    <View style={[styles.banner, style]}>
      <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderColor: "#F4B9B4",
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textWrap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.small,
    color: colors.danger,
    fontWeight: "800",
  },
  message: {
    ...typography.small,
    color: colors.text,
    marginTop: 2,
  },
});
