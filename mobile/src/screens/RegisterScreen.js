import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LegalModal from '../components/LegalModal';
import termsPT from '../legal/termsPT';
import privacyPT from '../legal/privacyPT';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // legais
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canRegister = name && email && password && password === confirm && acceptedTerms && acceptedPrivacy;

  const onSubmit = async () => {
    if (!canRegister) {
      Alert.alert('Atenção', 'Lê e aceita os Termos e a Política de Privacidade para continuar.');
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password, {
        acceptedTerms: true,
        acceptedPrivacy: true,
      });
      // login automático no AuthContext
    } catch (e) {
      const msg = e?.response?.data?.msg || 'Falha no registo';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirmar Password" secureTextEntry value={confirm} onChangeText={setConfirm} />

      {/* Botões de leitura obrigatória */}
      <View style={{ marginTop: 6 }}>
        <TouchableOpacity style={styles.linkBtn} onPress={() => setShowTerms(true)}>
          <Text style={styles.linkBtnTxt}>{acceptedTerms ? '✅ Termos de Utilização (aceites)' : 'Ler Termos de Utilização'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => setShowPrivacy(true)}>
          <Text style={styles.linkBtnTxt}>{acceptedPrivacy ? '✅ Política de Privacidade (aceite)' : 'Ler Política de Privacidade'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, !canRegister && { opacity: 0.6 }]} onPress={onSubmit} disabled={loading || !canRegister}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registar</Text>}
      </TouchableOpacity>

      <Text style={styles.switch}>
        Já tens conta?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Entrar
        </Text>
      </Text>

      {/* Modais */}
      <LegalModal
        visible={showTerms}
        title="Termos de Utilização"
        content={termsPT}
        onClose={() => setShowTerms(false)}
        onAccept={() => { setAcceptedTerms(true); setShowTerms(false); }}
      />
      <LegalModal
        visible={showPrivacy}
        title="Política de Privacidade"
        content={privacyPT}
        onClose={() => setShowPrivacy(false)}
        onAccept={() => { setAcceptedPrivacy(true); setShowPrivacy(false); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f6f6f6' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 14, borderRadius: 10, marginBottom: 12 },
  linkBtn: { paddingVertical: 10 },
  linkBtnTxt: { color: '#8B0000', fontWeight: '700' },
  button: { backgroundColor: '#8B0000', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  switch: { marginTop: 16, textAlign: 'center' },
  link: { color: '#007aff', fontWeight: '600' },
});
