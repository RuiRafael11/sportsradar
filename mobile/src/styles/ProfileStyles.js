import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
    padding: 14, borderRadius: 10, marginBottom: 12,
  },
  button: { backgroundColor: "#000", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  logout: { backgroundColor: "#900", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 12 },
});
