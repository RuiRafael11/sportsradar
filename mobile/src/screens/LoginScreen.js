import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import InputField from "../components/InputField";
import { colors, spacing, typography } from "../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Preenche o email e a password para entrar.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e) {
      setError(e?.response?.data?.msg || "Nao foi possivel iniciar sessao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>SportsRadar</Text>
          <Text style={styles.title}>Encontra o teu proximo recinto</Text>
          <Text style={styles.subtitle}>
            Pesquisa, agenda e acompanha reservas desportivas num so lugar.
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Entrar</Text>
          <Text style={styles.cardSubtitle}>Usa a tua conta para continuar.</Text>

          <ErrorBanner message={error} style={styles.error} />

          <InputField
            label="Email"
            icon="mail-outline"
            placeholder="nome@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
          />

          <InputField
            label="Password"
            icon="lock-closed-outline"
            placeholder="A tua password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textContentType="password"
          />

          <Button title="Entrar" onPress={onSubmit} loading={loading} icon="log-in-outline" />
          <Button
            title="Criar conta"
            onPress={() => navigation.navigate("Register")}
            variant="quiet"
            style={styles.secondaryAction}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
  },
  brand: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  card: {
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.title,
  },
  cardSubtitle: {
    ...typography.subtitle,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.md,
  },
  secondaryAction: {
    marginTop: spacing.sm,
  },
});
