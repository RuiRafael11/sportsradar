import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  venueName: { fontSize: 16, fontWeight: "800", flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: "#8B0000",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  when: { marginTop: 6, fontSize: 14 },
  meta: { marginTop: 2, color: "#666", fontSize: 12 },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptySubtitle: { color: "#666" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#8B0000" },
  tabTxt: { fontWeight: "700", color: "#333" },
  tabTxtActive: { color: "#fff" },
});
