// mobile/src/components/MapComponent.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const DEFAULT_KEYWORDS = ['padel','futebol','futsal','tenis','polidesportivo'];

export default function MapComponent({ navigation }) {
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    (async () => {
      // 1) localização por defeito
      let lat = 39.5, lng = -8.0; // centro PT
      let radius = 10000;         // 10 km
      let keywords = DEFAULT_KEYWORDS;

      // 2) tenta carregar preferências locais
      try {
        const raw = await AsyncStorage.getItem('@prefs');
        if (raw) {
          const p = JSON.parse(raw);
          if (typeof p.radiusKm === 'number') radius = Math.max(1000, p.radiusKm * 1000);
          if (Array.isArray(p.sports) && p.sports.length) keywords = p.sports;
          if (typeof p.baseLat === 'number' && typeof p.baseLng === 'number') {
            lat = p.baseLat; lng = p.baseLng;
          }
        }
      } catch {}

      // 3) se não houver cidade base, usa GPS
      if (!(lat && lng) || (lat === 39.5 && lng === -8.0)) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const geo = await Location.getCurrentPositionAsync({});
          lat = geo.coords.latitude;
          lng = geo.coords.longitude;
        }
      }

      // 4) centra mapa (zoom in)
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });

      // 5) pede à API de Places do teu backend
      try {
        const r = await api.get('/places/search', {
          params: { lat, lng, radius, keywords: keywords.join(',') }
        });
        setMarkers(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.warn('places/search failed:', e?.response?.data?.msg || e.message);
        setMarkers([]);
      }
    })();
  }, []); // quando voltares do Perfil, podes puxar para baixo no mapa para atualizar

  if (!region) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <MapView style={{ flex:1 }} initialRegion={region}>
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
