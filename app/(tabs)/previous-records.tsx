import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { fetchExercises, fetchPreviousRecords, deleteWorkout } from './api-calls';
import { RootStackParamList, WorkoutRecord } from './interfaces'
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';

const PreviousRecords = () => {
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [activeRecordExercise, setActiveRecordExercise] = useState<string>('');
  const [previousRecord, setPreviousRecord] = useState<WorkoutRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  useEffect(() => {
    const fetchUserId = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          setUserId(Number(storedUserId));
        } catch (error) {
          console.error('Failed to decode user ID:', error);
        }
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchExercises(setAvailableExercises);
    }
  }, [userId]);

  useEffect(() => {
    const filtered = availableExercises.filter(exercise =>
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchQuery, availableExercises]);

  const handleExerciseSelection = async (exercise: string) => {
    navigation.navigate('ExerciseSets', { exercise });
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    const isDeleted = await deleteWorkout(workoutId);
    if (isDeleted) {
      fetchPreviousRecords(activeRecordExercise, setPreviousRecord);
    } else {
      Alert.alert('Erro', 'Falha ao deletar treino');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for previous workouts</Text>

      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for an exercise"
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseItem} onPress={() => handleExerciseSelection(item)}>
            <Text style={styles.exerciseText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No exercises found.</Text>}
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
  exerciseItem: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginVertical: 5,
  },
  exerciseText: {
    fontSize: 16,
  },
  recordItem: {
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
  recordText: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#f8f8f8',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PreviousRecords;
