import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './interfaces';

const UserAuth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        navigation.navigate('Welcome'); // Navigate to Welcome screen if token exists
      }
    };
    checkToken();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:5000/api/users/login', { username, password });

      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('userId', (res.data.userId).toString());

      navigation.navigate('Welcome'); 
    } catch (err) {
      console.error('Login failed:', err);
      Alert.alert('Login Error', 'Invalid username or password');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://10.0.2.2:5000/api/users/register', { username, password });
      Alert.alert('Success', 'Registered successfully');
    } catch (err) {
      console.error('Registration failed:', err);
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acessar / Criar conta</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Acessar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
        <Text style={styles.buttonText}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#3b5391',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserAuth;