import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#555",
  },

  // Card
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  venueName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    fontSize: 12,
    color: "#8B0000",
    borderWidth: 1,
    borderColor: "#8B0000",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 8,
  },
  when: {
    fontSize: 15,
    color: "#111",
    marginBottom: 2,
    fontStyle: "italic",
  },
  meta: {
    fontSize: 12,
    color: "#777",
  },
});
