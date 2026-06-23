// mobile/src/screens/ScheduleEventScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import CalendarComponent from "../components/CalendarComponent";
import TimePickerComponent from "../components/TimePickerComponent";
import { api } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import StatusPill from "../components/StatusPill";
import { colors, radius, spacing, typography } from "../theme";

export default function ScheduleEventScreen({ navigation, route }) {
  const passedVenue = route?.params?.venue || null;
  const [venues, setVenues] = useState([]);
  const [venueId, setVenueId] = useState(route?.params?.venueId || passedVenue?._id || null);
  const [venueName, setVenueName] = useState(route?.params?.venueName || passedVenue?.name || "");
  const [venueDetails, setVenueDetails] = useState(passedVenue || null);

  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formError, setFormError] = useState("");

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadVenues = async () => {
      if (route?.params?.venueId || passedVenue) return;

      try {
        setLoadingVenues(true);
        const { data } = await api.get("/venues");
        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];
        setVenues(list);

        setVenueId((currentVenueId) => {
          if (currentVenueId || list.length === 0) return currentVenueId;

          const first = list[0];
          setVenueName(first.name || "");
          setVenueDetails(first);
          return first._id;
        });
      } catch (e) {
        if (mounted) {
          Alert.alert("Recintos", e?.userMessage || "Nao foi possivel carregar os recintos.");
        }
      } finally {
        if (mounted) setLoadingVenues(false);
      }
    };

    loadVenues();
    return () => {
      mounted = false;
    };
  }, [route?.params?.venueId, passedVenue]);

  useEffect(() => {
    let mounted = true;

    const loadDetails = async () => {
      if (!venueId) return;

      if (!String(venueId).startsWith("g:")) {
        try {
          setLoadingDetails(true);
          const { data } = await api.get(`/venues/${venueId}`);
          if (mounted) setVenueDetails(data || null);
        } catch {
          if (mounted) setVenueDetails(null);
        } finally {
          if (mounted) setLoadingDetails(false);
        }
        return;
      }

      const base = passedVenue || { _id: venueId, name: route?.params?.venueName || "" };
      setVenueDetails(base);

      const extra = await api
        .get(`/venue-extras/${encodeURIComponent(venueId)}`)
        .then((r) => r.data)
        .catch(() => null);

      if (mounted && extra?.details) {
        setVenueDetails({ ...base, details: extra.details });
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [venueId, passedVenue, route?.params?.venueName]);

  const canContinue = useMemo(
    () => Boolean(venueId && selectedDay && selectedTime),
    [venueId, selectedDay, selectedTime]
  );

  const onConfirm = () => {
    setFormError("");
    if (!venueId) {
      setFormError("Escolhe um recinto antes de continuar.");
      return;
    }
    if (!selectedDay || !selectedTime) {
      setFormError("Seleciona o dia e a hora da reserva.");
      return;
    }

    navigation.navigate("PaymentCheckout", {
      venueId,
      venueName,
      venue: passedVenue || venueDetails || null,
      date: selectedDay,
      time: selectedTime,
      amountCents: 1200,
      currency: "eur",
    });
  };

  const d = venueDetails?.details || {};
  const firstStep = !route?.params?.venueId && !passedVenue ? "2" : "1";

  return (
    <KeyboardAwareScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={80}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Reserva</Text>
        <Text style={styles.title}>Escolhe o dia e a hora</Text>
        <Text style={styles.subtitle}>Confirma os detalhes antes de avancar para pagamento.</Text>
      </View>

      <ErrorBanner message={formError} title="Reserva incompleta" style={styles.banner} />

      {!route?.params?.venueId && !passedVenue ? (
        <StepCard step="1" title="Selecionar recinto" icon="business-outline">
          {loadingVenues ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={venueId}
                onValueChange={(val) => {
                  setVenueId(val);
                  const v = venues.find((x) => x._id === val);
                  setVenueName(v?.name || "");
                  setVenueDetails(v || null);
                }}
              >
                {!venues.length ? <Picker.Item label="Sem recintos disponiveis" value={null} /> : null}
                {venues.map((v) => (
                  <Picker.Item key={v._id} label={v.name} value={v._id} />
                ))}
              </Picker>
            </View>
          )}
        </StepCard>
      ) : null}

      <StepCard step={firstStep} title="Recinto selecionado" icon="location-outline">
        {loadingDetails ? (
          <ActivityIndicator color={colors.primary} />
        ) : venueDetails ? (
          <>
            <Text style={styles.venueTitle}>{venueDetails.name || venueName || "Recinto"}</Text>
            <Text style={styles.venueMeta}>
              {[String(venueDetails.type || "").toLowerCase(), venueDetails.district].filter(Boolean).join(" - ") ||
                "Detalhes do recinto"}
            </Text>
            {venueDetails.address ? <Text style={styles.venueAddress}>{venueDetails.address}</Text> : null}
            <View style={styles.pills}>
              {d.pricePerHour != null ? (
                <StatusPill tone="primary">{Number(d.pricePerHour).toFixed(2)} EUR/h</StatusPill>
              ) : (
                <StatusPill>Preco a confirmar</StatusPill>
              )}
              {d.openingHours ? <StatusPill>{d.openingHours}</StatusPill> : null}
            </View>
          </>
        ) : (
          <EmptyState
            compact
            icon="alert-circle-outline"
            title="Sem detalhes disponiveis"
            message="Podes continuar se o recinto estiver selecionado."
          />
        )}
      </StepCard>

      <StepCard step={String(Number(firstStep) + 1)} title="Escolher dia" icon="calendar-outline">
        <View style={styles.calendarWrap}>
          <CalendarComponent onDaySelect={setSelectedDay} />
        </View>
        {selectedDay ? <Text style={styles.selectedText}>Dia selecionado: {selectedDay}</Text> : null}
      </StepCard>

      <StepCard step={String(Number(firstStep) + 2)} title="Escolher hora" icon="time-outline">
        <TimePickerComponent selectedTime={selectedTime} onTimeChange={setSelectedTime} />
        {selectedTime ? <Text style={styles.selectedText}>Hora selecionada: {selectedTime}</Text> : null}
      </StepCard>

      <Card style={styles.summary}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <SummaryLine label="Recinto" value={venueDetails?.name || venueName || "Por escolher"} />
        <SummaryLine label="Dia" value={selectedDay || "Por escolher"} />
        <SummaryLine label="Hora" value={selectedTime || "Por escolher"} />
        <Button
          title="Continuar para pagamento"
          icon="card-outline"
          onPress={onConfirm}
          disabled={!canContinue}
          style={styles.confirm}
        />
      </Card>
    </KeyboardAwareScrollView>
  );
}

function StepCard({ step, title, icon, children }) {
  return (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Text style={styles.stepNumber}>{step}</Text>
        </View>
        <View style={styles.stepTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      {children}
    </Card>
  );
}

function SummaryLine({ label, value }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  banner: {
    marginBottom: spacing.md,
  },
  stepCard: {
    marginBottom: spacing.md,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  stepTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  venueTitle: {
    ...typography.title,
  },
  venueMeta: {
    ...typography.small,
    marginTop: spacing.xs,
  },
  venueAddress: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  calendarWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  summary: {
    marginTop: spacing.sm,
  },
  summaryLine: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    ...typography.small,
    fontWeight: "800",
  },
  summaryValue: {
    ...typography.body,
    marginTop: 2,
  },
  confirm: {
    marginTop: spacing.md,
  },
});
