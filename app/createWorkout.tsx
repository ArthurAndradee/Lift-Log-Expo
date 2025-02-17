import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { fetchExercises } from './api-calls';

const CreateWorkout = () => {
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<{ name: string; sets: string; reps: string }[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

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
    setSelectedExercises([...selectedExercises, { name: exercise, sets: '', reps: '' }]);
    setAvailableExercises(availableExercises.filter((ex) => ex !== exercise));
    setExerciseSearch('');
    setFilteredExercises([]);
    setIsDropdownVisible(false);
  };

  const removeExerciseFromWorkout = (exercise: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.name !== exercise));
    setAvailableExercises([...availableExercises, exercise]);
  };

  const updateExerciseField = (exerciseName: string, field: 'sets' | 'reps', value: string) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.map((ex) => (ex.name === exerciseName ? { ...ex, [field]: value } : ex))
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
    if (selectedExercises.some(ex => !ex.sets || !ex.reps)) {
      Alert.alert('Erro', 'Preencha o número de séries e repetições para cada exercício.');
      return;
    }

    const workoutData = { name: workoutName, exercises: selectedExercises };
    console.log('Workout:', workoutData);

    // Save workout (uncomment when implementing backend)
    // const result = await createWorkout(workoutName, selectedExercises);
    // if (result.success) {
    //   Alert.alert('Sucesso', 'Treino criado com sucesso!');
    //   setWorkoutName('');
    //   setSelectedExercises([]);
    //   setAvailableExercises([]);
    //   fetchExercises(setAvailableExercises);
    // } else {
    //   Alert.alert('Erro', 'Falha ao criar treino.');
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Novo Treino</Text>

      <Text style={styles.label}>Nome do Treino</Text>
      <TextInput
        style={styles.input}
        value={workoutName}
        onChangeText={setWorkoutName}
        placeholder="Nome do Treino"
      />

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
            <View style={styles.exerciseInfo}>
              <Text style={styles.setText}>{item.name}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputSmall}
                  value={item.sets}
                  onChangeText={(text) => updateExerciseField(item.name, 'sets', text)}
                  placeholder="Séries"
                  keyboardType="numeric"
                />
                <Text style={styles.labelSmall}>x</Text>
                <TextInput
                  style={styles.inputSmall}
                  value={item.reps}
                  onChangeText={(text) => updateExerciseField(item.name, 'reps', text)}
                  placeholder="Reps"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => removeExerciseFromWorkout(item.name)}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>Nenhum exercício adicionado.</Text>}
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
    flexDirection: 'row',
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
});

export default CreateWorkout;
