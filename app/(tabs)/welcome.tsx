import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
  const navigation = useNavigation();
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login'); // Navigate back to Login screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('WorkoutContainer')}>
        <Text style={styles.link}>Registrar treino</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('PreviousRecords')}>
        <Text style={styles.link}>Ver treinos anteriores</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair</Text>
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
  link: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Welcome;