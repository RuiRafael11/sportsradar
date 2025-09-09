import React, { useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function LegalModal({ visible, onClose, title, content, onAccept }) {
  const [atBottom, setAtBottom] = useState(false);

  const onScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const reached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 16;
    if (reached) setAtBottom(true);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <Text style={s.title}>{title}</Text>
        <ScrollView style={s.body} onScroll={onScroll} scrollEventThrottle={16}>
          <Text style={s.text}>{content}</Text>
        </ScrollView>

        {!atBottom && <Text style={s.hint}>Desliza até ao fim para poderes aceitar</Text>}

        <View style={s.row}>
          <TouchableOpacity style={[s.btn, s.secondary]} onPress={onClose}>
            <Text style={[s.btnTxt, { color: '#111' }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, !atBottom && { opacity: 0.5 }]}
            disabled={!atBottom}
            onPress={onAccept}
          >
            <Text style={s.btnTxt}>Aceito</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  body: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12 },
  text: { fontSize: 14, lineHeight: 20, color: '#111827' },
  hint: { textAlign: 'center', marginTop: 8, color: '#6B7280' },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, backgroundColor: '#8B0000', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondary: { backgroundColor: '#F3F4F6' },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
