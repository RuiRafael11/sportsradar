import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import LegalModal from "../components/LegalModal";
import termsPT from "../legal/termsPT";
import privacyPT from "../legal/privacyPT";
import Button from "../components/Button";
import Card from "../components/Card";
import ErrorBanner from "../components/ErrorBanner";
import InputField from "../components/InputField";
import { colors, radius, spacing, typography } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canRegister = useMemo(
    () =>
      Boolean(
        name.trim() &&
          email.trim() &&
          password &&
          password === confirm &&
          acceptedTerms &&
          acceptedPrivacy
      ),
    [name, email, password, confirm, acceptedTerms, acceptedPrivacy]
  );

  const onSubmit = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Preenche todos os campos para criar a conta.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords nao coincidem.");
      return;
    }
    if (!acceptedTerms || !acceptedPrivacy) {
      setError("Le e aceita os Termos e a Politica de Privacidade para continuar.");
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password, {
        acceptedTerms: true,
        acceptedPrivacy: true,
      });
    } catch (e) {
      setError(e?.response?.data?.msg || "Nao foi possivel criar a conta.");
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
          <Text style={styles.title}>Cria a tua conta</Text>
          <Text style={styles.subtitle}>
            Define o teu acesso e aceita os documentos legais para comecar.
          </Text>
        </View>

        <Card style={styles.card}>
          <ErrorBanner message={error} style={styles.error} />

          <InputField
            label="Nome"
            icon="person-outline"
            placeholder="O teu nome"
            value={name}
            onChangeText={setName}
            textContentType="name"
          />
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
            placeholder="Escolhe uma password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
          />
          <InputField
            label="Confirmar password"
            icon="shield-checkmark-outline"
            placeholder="Repete a password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            textContentType="newPassword"
          />

          <View style={styles.legalWrap}>
            <LegalRow
              title="Termos de Utilizacao"
              accepted={acceptedTerms}
              onPress={() => setShowTerms(true)}
            />
            <LegalRow
              title="Politica de Privacidade"
              accepted={acceptedPrivacy}
              onPress={() => setShowPrivacy(true)}
            />
          </View>

          <Button
            title="Criar conta"
            onPress={onSubmit}
            loading={loading}
            disabled={!canRegister}
            icon="person-add-outline"
            style={styles.primaryAction}
          />
          <Button
            title="Ja tenho conta"
            onPress={() => navigation.navigate("Login")}
            variant="quiet"
            style={styles.secondaryAction}
          />
        </Card>
      </ScrollView>

      <LegalModal
        visible={showTerms}
        title="Termos de Utilizacao"
        content={termsPT}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTerms(false);
        }}
      />
      <LegalModal
        visible={showPrivacy}
        title="Politica de Privacidade"
        content={privacyPT}
        onClose={() => setShowPrivacy(false)}
        onAccept={() => {
          setAcceptedPrivacy(true);
          setShowPrivacy(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function LegalRow({ title, accepted, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.legalRow}>
      <Ionicons
        name={accepted ? "checkmark-circle" : "document-text-outline"}
        size={20}
        color={accepted ? colors.success : colors.primary}
      />
      <Text style={styles.legalText}>{accepted ? `${title} aceites` : `Ler ${title}`}</Text>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </TouchableOpacity>
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
    paddingTop: spacing.xxl,
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
  error: {
    marginBottom: spacing.md,
  },
  legalWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  legalRow: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  legalText: {
    flex: 1,
    color: colors.text,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  primaryAction: {
    marginTop: spacing.xs,
  },
  secondaryAction: {
    marginTop: spacing.sm,
  },
});
