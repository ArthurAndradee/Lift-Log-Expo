import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Set } from './interfaces';
import { addSet, fetchExercises, logWorkout } from './api-calls';

const LogExercise = () => {
  const [exercise, setExercise] = useState('');
  const [setReps, setSetReps] = useState(0);
  const [setWeight, setSetWeight] = useState(0);
  const [sets, setSets] = useState<Set[]>([]);
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]); // New state for filtered exercises
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Control visibility of the dropdown

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
    const result = await logWorkout(exercise, sets, null);
    if (result.logged) {
      setExercise('');
      setSets([]);
      setSetWeight(0);
      setSetReps(0);
    } else {
      Alert.alert('Erro', 'Falha ao registrar treino.');
    }
  };

  const handleSearchChange = (text: string) => {
    setExercise(text);
    if (text) {
      const filtered = availableExercises.filter((ex) => ex.toLowerCase().includes(text.toLowerCase()));
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises([]);
    }
  };

  // Validation function to check if the selected exercise is valid
  const isExerciseValid = () => {
    return availableExercises.includes(exercise.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar a um Exercício Existente</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={exercise}
          onChangeText={handleSearchChange}
          placeholder="Pesquisar Exercício"
          onFocus={() => setIsDropdownVisible(true)} // Show dropdown when input is focused
          onBlur={() => setIsDropdownVisible(false)} // Hide dropdown when input loses focus
        />
      </View>

      {/* Only show dropdown if the input is focused */}
      {isDropdownVisible && (
        <FlatList
          data={filteredExercises.length > 0 ? filteredExercises : availableExercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setExercise(item);
                setIsDropdownVisible(false); // Hide the list after selecting an exercise
              }}
            >
              <Text style={styles.dropdownText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

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

      <View style={styles.buttonBox}>
        <TouchableOpacity style={styles.button} onPress={handleAddSet}>
          <Text style={styles.buttonText}>Adicionar Série</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { opacity: isExerciseValid() ? 1 : 0.5 }]} // Only enable if the exercise is valid
          onPress={handleLogWorkout}
          disabled={!isExerciseValid()} // Disable button if exercise is invalid
        >
          <Text style={styles.buttonText}>Registrar Treino</Text>
        </TouchableOpacity>
      </View>

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
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  flex1: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonBox: {
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3b5391',
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
