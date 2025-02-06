import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Set } from './interfaces';
import { addSet, fetchExercises, logWorkout } from './api-calls';
import { Picker } from '@react-native-picker/picker';

const LogExercise = () => {
  const [exercise, setExercise] = useState('');
  const [setReps, setSetReps] = useState(0);
  const [setWeight, setSetWeight] = useState(0);
  const [sets, setSets] = useState<Set[]>([]);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          setUserId(Number(storedUserId));
        } catch (error) {
          console.error('Failed to retrieve user ID:', error);
        }
      }
    };

    const loadExercises = async () => {
      await fetchExercises(setAvailableExercises);
    };

    fetchUserData();
    loadExercises();
  }, []);

  const handleAddSet = () => {
    const result = addSet(sets, setWeight, setReps, setSets);
    if (!result.valid) {
      Alert.alert('Erro', result.message);
    }
  };

  const handleLogWorkout = async () => {
    const result = await logWorkout(exercise, sets);
    if (result.logged) {
      setExercise('');
      setSets([]);
      setSetWeight(0);
      setSetReps(0);
    } else {
      Alert.alert('Erro', 'Falha ao registrar treino.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar a um Exercício Existente</Text>

      <Picker
        selectedValue={exercise}
        style={styles.picker}
        onValueChange={(itemValue: React.SetStateAction<string>) => setExercise(itemValue)}
      >
        <Picker.Item label="Selecione um Exercício" value="" />
        {availableExercises.map((ex, index) => (
          <Picker.Item key={index} label={ex} value={ex} />
        ))}
      </Picker>

      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput
        style={styles.input}
        value={setWeight.toString()}
        onChangeText={(text) => setSetWeight(Number(text))}
        keyboardType="numeric"
        placeholder="Peso"
      />

      <Text style={styles.label}>Repetições</Text>
      <TextInput
        style={styles.input}
        value={setReps.toString()}
        onChangeText={(text) => setSetReps(Number(text))}
        keyboardType="numeric"
        placeholder="Reps"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddSet}>
        <Text style={styles.buttonText}>Adicionar Série</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogWorkout}>
        <Text style={styles.buttonText}>Registrar Treino</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Séries Adicionadas:</Text>
      <FlatList
        data={sets}
        keyExtractor={(item) => item.setNumber.toString()}
        renderItem={({ item }) => (
          <View style={styles.setItem}>
            <Text style={styles.setText}>
              <Text style={styles.bold}>Set {item.setNumber}:</Text> {item.weight} kg, {item.reps} reps
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>Nenhuma série adicionada.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3b5391', // Updated to the specified color
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  setText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  noResults: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LogExercise;