// mobile/src/components/MapComponent.js
import React, { useCallback, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

const DEFAULT_KEYWORDS = ['padel','futebol','futsal','tenis','polidesportivo'];

export default function MapComponent({ navigation }) {
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);

  const load = useCallback(async () => {
    // base defaults
    let lat = 39.5, lng = -8.0; // PT
    let radius = 10000;
    let keywords = DEFAULT_KEYWORDS;

    // prefs locais
    try {
      const raw = await AsyncStorage.getItem('@prefs');
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.radiusKm === 'number') radius = Math.max(1000, p.radiusKm * 1000);
        if (Array.isArray(p.sports) && p.sports.length) {
          keywords = p.sports.map(s => String(s).toLowerCase());
        }
        if (typeof p.baseLat === 'number' && typeof p.baseLng === 'number') {
          lat = p.baseLat; lng = p.baseLng;
        }
      }
    } catch {}

    // se continuar por defeito, tenta GPS
    if (lat === 39.5 && lng === -8.0) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const geo = await Location.getCurrentPositionAsync({});
        lat = geo.coords.latitude;
        lng = geo.coords.longitude;
      }
    }

    // centra (controlado)
    setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });

    // fetch Places
    try {
      const r = await api.get('/places/search', {
        params: { lat, lng, radius, keywords: keywords.join(',') }
      });
      setMarkers(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.warn('places/search failed:', e?.response?.data?.msg || e.message);
      setMarkers([]);
    }
  }, []);

  // recarrega sempre que voltas ao ecrã Find/Map
  useFocusEffect(useCallback(() => {
    let mounted = true;
    (async () => {
      // truque: se prefs mudaram, garante refresh
      await AsyncStorage.getItem('@prefs_bump'); // só para ter uma dependência persistida
      if (mounted) load();
    })();
    return () => { mounted = false; };
  }, [load]));

  if (!region) {
    return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator/></View>;
  }

  return (
    <MapView style={{ flex:1 }} region={region} onRegionChangeComplete={setRegion}>
      {markers.map(m => (
        <Marker key={m._id} coordinate={{ latitude: m.lat, longitude: m.lng }}>
          <Callout onPress={() => navigation.navigate('SportDetail', { venueId: m._id, venue: m })}>
            <Text style={{ fontWeight:'700' }}>{m.name}</Text>
            <Text>{(m.type || '').toLowerCase()}</Text>
            <Text style={{ color:'#8B0000', marginTop:4 }}>Tocar para ver detalhe</Text>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
