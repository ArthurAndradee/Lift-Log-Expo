import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Set } from "./interfaces";
import { createWorkout, fetchExercises, logWorkout } from './api-calls';
import { useRouter } from 'expo-router';

const CreateWorkout = () => {
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    { name: string; sets: Set[] }[]
  >([]);
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadExercises = async () => {
      await fetchExercises(setAvailableExercises);
    };
    loadExercises();
  }, []);

  const handleSearchChange = (text: string) => {
    setExerciseSearch(text);
    if (text) {
      const filtered = availableExercises.filter(
        (ex) => ex.toLowerCase().includes(text.toLowerCase()) && !selectedExercises.some(se => se.name === ex)
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises([]);
    }
  };

  const addExerciseToWorkout = (exercise: string) => {
    setSelectedExercises([...selectedExercises, { name: exercise, sets: [] }]);
    setAvailableExercises(availableExercises.filter((ex) => ex !== exercise));

    setExerciseSearch('');
    setFilteredExercises([]);
    setIsDropdownVisible(false);
  };

  const removeExerciseFromWorkout = (exercise: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.name !== exercise));
    setAvailableExercises([...availableExercises, exercise]);
  };

  const updateSetField = (exerciseName: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.name === exerciseName
          ? {
              ...ex,
              sets: ex.sets.map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  const addSetToExercise = (exerciseName: string) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.name === exerciseName
          ? { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const removeSetFromExercise = (exerciseName: string, setIndex: number) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.name === exerciseName
          ? { ...ex, sets: ex.sets.filter((_, index) => index !== setIndex) }
          : ex
      )
    );
  };

  const handleCreateWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Erro', 'O nome do treino não pode estar vazio.');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício ao treino.');
      return;
    }
    if (selectedExercises.some(ex => ex.sets.some(set => !set.reps || !set.weight))) {
      Alert.alert('Erro', 'Preencha todas as repetições e pesos para cada série.');
      return;
    }

    try {
      const workoutResponse = await createWorkout(workoutName);

      if (!workoutResponse || !workoutResponse.workoutId) {
        Alert.alert('Erro', 'Falha ao criar o treino.');
        return;
      }
  
      const workoutId = workoutResponse.workoutId;

      const logResults = await Promise.all(
        selectedExercises.map(exercise => logWorkout(exercise.name, exercise.sets, workoutId))
      );

      if (logResults.every(result => result.logged)) {
        setSelectedExercises([]);
        setWorkoutName('');

        router.push('/workoutContainer');
      } else {
        Alert.alert('Erro', 'Falha ao registrar treino.');
      }
      
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar o treino.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Treino</Text>

      <Text style={styles.label}>Nome do Treino</Text>
      <TextInput style={styles.input} value={workoutName} onChangeText={setWorkoutName} placeholder="Nome do Treino" />

      <Text style={styles.label}>Adicionar Exercícios</Text>
      <TextInput
        style={styles.input}
        value={exerciseSearch}
        onChangeText={handleSearchChange}
        placeholder="Pesquisar Exercício"
        onFocus={() => {
          setIsDropdownVisible(true);
          setFilteredExercises(availableExercises);
        }}
      />

      {isDropdownVisible && (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => addExerciseToWorkout(item)}>
              <Text style={styles.dropdownText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.label}>Exercícios Selecionados:</Text>
      <FlatList
        data={selectedExercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.setItem}>
            <Text style={styles.setText}>{item.name}</Text>
            {item.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text>Set {setIndex + 1}:</Text>
                <TextInput
                  style={styles.inputSmall}
                  value={set.reps.toString()}
                  onChangeText={(text) => updateSetField(item.name, setIndex, 'reps', text)}
                  placeholder="Reps"
                  keyboardType="numeric"
                />
                <Text style={styles.labelSmall}>x</Text>
                <TextInput
                  style={styles.inputSmall}
                  value={set.weight.toString()}
                  onChangeText={(text) => updateSetField(item.name, setIndex, 'weight', text)}
                  placeholder="Peso"
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => removeSetFromExercise(item.name, setIndex)}>
                  <Text style={styles.removeText}>✖</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addSetToExercise(item.name)}>
              <Text style={styles.addSetText}>+ Adicionar Série</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeExerciseFromWorkout(item.name)}>
              <Text style={styles.removeText}>Remover Exercício</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateWorkout}>
        <Text style={styles.buttonText}>Criar Treino</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  labelSmall: {
    fontSize: 16,
    marginHorizontal: 5,
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
  inputSmall: {
    height: 40,
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
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
  setItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseInfo: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  setText: {
    fontSize: 16,
  },
  removeText: {
    color: 'red',
    fontSize: 14,
    marginLeft: 10,
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
  noResults: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  addSetText: {
    color: '#3b5391',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default CreateWorkout;
