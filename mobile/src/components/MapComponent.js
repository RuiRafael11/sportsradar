// mobile/src/components/MapComponent.js
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api, getApiErrorMessage } from '../services/api';
import { colors, radius, spacing, typography } from '../theme';

const DEFAULT_KEYWORDS = ['padel', 'futebol', 'futsal', 'tenis', 'polidesportivo'];

export default function MapComponent({ navigation }) {
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loadingMarkers, setLoadingMarkers] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    let lat = 39.5;
    let lng = -8.0;
    let radiusMeters = 10000;
    let keywords = DEFAULT_KEYWORDS;

    try {
      const raw = await AsyncStorage.getItem('@prefs');
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.radiusKm === 'number') radiusMeters = Math.max(1000, p.radiusKm * 1000);
        if (Array.isArray(p.sports) && p.sports.length) {
          keywords = p.sports.map((s) => String(s).toLowerCase());
        }
        if (typeof p.baseLat === 'number' && typeof p.baseLng === 'number') {
          lat = p.baseLat;
          lng = p.baseLng;
        }
      }
    } catch {}

    if (lat === 39.5 && lng === -8.0) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const geo = await Location.getCurrentPositionAsync({});
          lat = geo.coords.latitude;
          lng = geo.coords.longitude;
        }
      } catch {}
    }

    setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });

    try {
      setLoadingMarkers(true);
      const r = await api.get('/places/search', {
        params: { lat, lng, radius: radiusMeters, keywords: keywords.join(',') },
      });
      setMarkers(Array.isArray(r.data) ? r.data : []);
      setLoadError('');
    } catch (e) {
      setMarkers([]);
      setLoadError(getApiErrorMessage(e, 'Nao foi possivel carregar recintos no mapa.'));
    } finally {
      setLoadingMarkers(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        await AsyncStorage.getItem('@prefs_bump');
        if (mounted) load();
      })();
      return () => {
        mounted = false;
      };
    }, [load])
  );

  if (!region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.centerText}>A preparar o mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
        {markers
          .filter((m) => Number.isFinite(Number(m.lat)) && Number.isFinite(Number(m.lng)))
          .map((m) => (
            <Marker key={m._id} coordinate={{ latitude: Number(m.lat), longitude: Number(m.lng) }}>
              <Callout onPress={() => navigation.navigate('SportDetail', { venueId: m._id, venue: m })}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{m.name}</Text>
                  <Text style={styles.calloutMeta}>{(m.type || '').toLowerCase()}</Text>
                  <Text style={styles.calloutLink}>Tocar para ver detalhe</Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {loadingMarkers || loadError || markers.length === 0 ? (
        <View style={styles.overlay}>
          {loadingMarkers ? (
            <View style={styles.overlayRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.overlayText}>A carregar recintos no mapa...</Text>
            </View>
          ) : (
            <>
              <View style={styles.overlayHeader}>
                <View style={styles.overlayIcon}>
                  <Ionicons
                    name={loadError ? 'alert-circle-outline' : 'map-outline'}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.overlayTitle}>
                  {loadError ? 'Mapa sem resultados' : 'Nenhum recinto visivel'}
                </Text>
              </View>
              <Text style={styles.overlayText}>
                {loadError || 'Confirma as preferencias, a localizacao ou a configuracao do Google Places.'}
              </Text>
              <TouchableOpacity activeOpacity={0.84} onPress={load} style={styles.refreshBtn}>
                <Ionicons name="refresh-outline" size={17} color={colors.primary} />
                <Text style={styles.refreshText}>Atualizar mapa</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  map: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  centerText: {
    ...typography.subtitle,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  callout: {
    width: 190,
    paddingVertical: spacing.xs,
  },
  calloutTitle: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 2,
  },
  calloutMeta: {
    color: colors.textMuted,
  },
  calloutLink: {
    color: colors.primary,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  overlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.mapOverlay,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  overlayIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  overlayTitle: {
    ...typography.sectionTitle,
    flex: 1,
  },
  overlayText: {
    ...typography.subtitle,
    flex: 1,
  },
  refreshBtn: {
    marginTop: spacing.md,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  refreshText: {
    color: colors.primary,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});
