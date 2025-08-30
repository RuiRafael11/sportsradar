import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  // search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 15,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  chipTxt: { color: "#333", fontWeight: "600" },
  chipTxtActive: { color: "#fff", fontWeight: "700" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 10,
  },

  // cards pequenos (sugestões)
  cardSmall: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardImg: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  cardSmallName: { fontSize: 16, fontWeight: "700" },
  cardSmallMeta: { fontSize: 12, color: "#666", marginTop: 2 },
  cardSmallActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillBtn: {
    backgroundColor: "#8B0000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillBtnTxt: { color: "#fff", fontWeight: "700" },

  // favoritos
  cardLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardLargeTitle: { fontSize: 16, fontWeight: "800" },
  cardLargeMeta: { fontSize: 12, color: "#666", marginTop: 2 },

  // lista
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowMeta: { fontSize: 12, color: "#666", marginTop: 2 },
});
