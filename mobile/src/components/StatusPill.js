import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export default function StatusPill({ children, tone = "neutral", style }) {
  const toneStyle = toneStyles[tone] || toneStyles.neutral;
  return (
    <View style={[styles.pill, toneStyle.wrap, style]}>
      <Text style={[styles.text, toneStyle.text]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
});

const toneStyles = {
  neutral: {
    wrap: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
    text: { color: colors.textMuted },
  },
  primary: {
    wrap: { backgroundColor: colors.primarySoft, borderColor: "#EDC7C7" },
    text: { color: colors.primary },
  },
  success: {
    wrap: { backgroundColor: colors.successSoft, borderColor: "#BFE7D1" },
    text: { color: colors.success },
  },
  danger: {
    wrap: { backgroundColor: colors.dangerSoft, borderColor: "#F4B9B4" },
    text: { color: colors.danger },
  },
};
