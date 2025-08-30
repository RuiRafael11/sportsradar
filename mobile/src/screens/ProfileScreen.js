import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles/ProfileStyles';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen(){
  const { logout } = useAuth();
  const [f,setF]=useState({ name:'', email:'' });
  const [pw,setPw]=useState('');
  useEffect(()=>{ api.get('/auth/me').then(r=>setF(r.data)); },[]);
  const save=async()=>{ 
    const body = { name: f.name }; if (pw) body.password = pw;
    await api.patch('/auth/me', body); Alert.alert('Perfil atualizado');
    setPw('');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <TextInput style={styles.input} value={f.name} onChangeText={(v)=>setF(p=>({...p,name:v}))}/>
      <TextInput style={[styles.input,{opacity:.7}]} value={f.email} editable={false}/>
      <TextInput style={styles.input} value={pw} onChangeText={setPw} placeholder="Nova password (opcional)" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={save}><Text style={styles.buttonText}>Guardar</Text></TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.buttonText}>Logout</Text></TouchableOpacity>
    </View>
  );
}
