import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Set } from '../constants/interfaces';
import { createWorkout, getExerciseNamesForWorkout, getWorkoutsForUser, logExercise } from '../constants/api-calls';
import { useRouter } from 'expo-router';

const RegisterExistingWorkout = () => {
  const [workoutIds, setWorkoutIds] = useState<number[]>([]);
  const [workoutExercisesData, setWorkoutExercisesData] = useState<{ 
    name: string; 
    sets: Set[];
  }[]>([]);
  const [availableWorkouts, setAvailableWorkouts] = useState<string[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<string[]>([]); // New state for filtered exercises
  const [workoutOption, setWorkoutOption] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Control visibility of the dropdown
  const router = useRouter();

  useEffect(() => {
    const loadExercises = async () => {
      const response = await getWorkoutsForUser();
    
      if (response) {
        // Create a map to store the most recent workout for each unique name
        const workoutMap = new Map();
  
        response.forEach((workout: { name: string; id: number; date: string }) => {
          // If the workout name is not in the map or this one is more recent
          if (!workoutMap.has(workout.name) || new Date(workout.date) > new Date(workoutMap.get(workout.name).date)) {
            workoutMap.set(workout.name, workout);
          }
        });
  
        // Extract unique workouts from the map
        const uniqueWorkouts = Array.from(workoutMap.values());
        
        // Set the workout IDs and names
        setWorkoutIds(uniqueWorkouts.map((workout: { id: number }) => workout.id));
        setAvailableWorkouts(uniqueWorkouts.map((workout: { name: string }) => workout.name));
      }
    };
    
    loadExercises();
  }, []);
  
  

  const addSetToExercise = (exerciseName: string) => {
    setWorkoutExercisesData((prevExercises) =>
      prevExercises.map((ex) =>
        ex.name === exerciseName
          ? { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const removeSetFromExercise = (exerciseName: string, setIndex: number) => {
    setWorkoutExercisesData((prevExercises) =>
      prevExercises.map((ex) =>
        ex.name === exerciseName
          ? { ...ex, sets: ex.sets.filter((_, index) => index !== setIndex) }
          : ex
      )
    );
  };

  const updateSetField = (exerciseName: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
    setWorkoutExercisesData((prevExercises) =>
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

  const handleRegisterWorkout = async () => {
    if (!workoutOption) {
      Alert.alert('Erro', 'Por favor, selecione um treino antes de registrar.');
      return;
    }
    const workoutResponse = await createWorkout(workoutOption);

    const workoutId = workoutResponse.workoutId;
    
    if (workoutId === -1) {
      Alert.alert('Erro', 'Treino inválido selecionado.');
      return;
    }

    try {
      await Promise.all(
        workoutExercisesData.map((exercise) => logExercise(exercise.name, exercise.sets, workoutId))
      );
      Alert.alert('Sucesso', 'Treino registrado com sucesso!');

      router.push('/workoutCreator');

    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar o treino.');
    }
  };

  const handleSearchChange = (text: string) => {
    setWorkoutOption(text);
    if (text) {
      const filtered = availableWorkouts.filter((ex) => ex.toLowerCase().includes(text.toLowerCase()));
      setFilteredWorkouts(filtered);
    } else {
      setFilteredWorkouts([]);
    }
  };

  const handleWorkoutSelection = (selectedWorkout: string) => {
    setWorkoutOption(selectedWorkout);
    setIsDropdownVisible(false);
    
    const workoutIndex = availableWorkouts.indexOf(selectedWorkout);
    if (workoutIndex === -1) return;

    const workoutId = workoutIds[workoutIndex];
    
    // Fetch the exercise names using the workoutId
    getExerciseNamesForWorkout(workoutId, (exerciseNames) => {
      setWorkoutExercisesData(
        exerciseNames.map((name) => ({
          name,
          sets: [],
        }))
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar um treino Existente</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={[styles.input, styles.flex1]}
          value={workoutOption}
          onChangeText={handleSearchChange}
          placeholder="Pesquisar Treino"
          onFocus={() => setIsDropdownVisible(true)}
        />
      </View>

      {isDropdownVisible && (
        <FlatList
          data={workoutOption.length > 0 ? filteredWorkouts : availableWorkouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleWorkoutSelection(item);
              }}
            >
              <Text style={styles.dropdownText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.title}>Exercícios:</Text>
      <FlatList
        data={workoutExercisesData}
        keyExtractor={(item) => item.name.toString()}
        renderItem={({ item }) => (
          <View style={styles.setItem}>
            <Text style={styles.setText}>{item.name}</Text>
            {item.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setIndex}>Set {setIndex + 1}:</Text>
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
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>Nenhuma treino escolhido.</Text>}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegisterWorkout}>
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
  inputSmall: {
    height: 40,
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  labelSmall: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  addSetText: {
    color: '#3b5391',
    fontWeight: 'bold',
    marginTop: 5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  setIndex: {
    fontSize: 16,
    marginRight: 10
  },
  removeText: {
    color: 'red',
    fontSize: 14,
    marginLeft: 10,
  },
});

export default RegisterExistingWorkout;
