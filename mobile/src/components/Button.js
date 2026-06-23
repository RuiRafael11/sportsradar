import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

export default function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;
  const stylesForVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, stylesForVariant.button, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={stylesForVariant.spinner} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={stylesForVariant.text.color}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.text, stylesForVariant.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
  },
  icon: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.58,
  },
});

const variantStyles = {
  primary: {
    button: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    text: {
      color: "#FFFFFF",
    },
    spinner: "#FFFFFF",
  },
  secondary: {
    button: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    text: {
      color: colors.primary,
    },
    spinner: colors.primary,
  },
  quiet: {
    button: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    text: {
      color: colors.text,
    },
    spinner: colors.text,
  },
  danger: {
    button: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    text: {
      color: "#FFFFFF",
    },
    spinner: "#FFFFFF",
  },
};
