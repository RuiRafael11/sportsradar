export const colors = {
  background: "#F6F3F1",
  surface: "#FFFFFF",
  surfaceAlt: "#FFF8F6",
  primary: "#8B0000",
  primaryDark: "#5F0000",
  primarySoft: "#F9E8E8",
  text: "#171717",
  textMuted: "#666A73",
  border: "#E6DDD9",
  borderStrong: "#D7C8C2",
  success: "#127A45",
  successSoft: "#E7F6EE",
  warning: "#A16207",
  warningSoft: "#FFF7D6",
  danger: "#B42318",
  dangerSoft: "#FDE9E7",
  mapOverlay: "rgba(255, 255, 255, 0.96)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 8,
  pill: 999,
};

export const typography = {
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};
