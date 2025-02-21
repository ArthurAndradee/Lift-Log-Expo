import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { getWorkoutsForUser } from '../../constants/api-calls';
import { RootStackParamList, Exercise, WorkoutReponse } from '../../constants/interfaces';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import dayjs from 'dayjs';
import React from 'react';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;  

const PreviousRecords = () => {
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutReponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<string[]>([]);
  const [searchMode, setSearchMode] = useState<'exercise' | 'workout'>('exercise');
  const [workoutDays, setWorkoutDays] = useState<string[]>([]);

  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const loadExercises = async () => {
      const response = await getWorkoutsForUser();
      
      if (response) {
        setAvailableWorkouts(response);
      }
    };

    loadExercises();
  }, [searchMode]);

  useEffect(() => {
    if (searchMode === 'workout') {
      // Sort workouts by date (most recent first)
      const sortedWorkouts = [...availableWorkouts].sort((a, b) =>
        dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      );
  
      // Group workouts by formatted date
      const groupedWorkouts: Record<string, WorkoutReponse[]> = {};
  
      sortedWorkouts.forEach((workout) => {
        const formattedDate = dayjs(workout.date).format('DD/MM/YYYY');
  
        if (!groupedWorkouts[formattedDate]) {
          groupedWorkouts[formattedDate] = [];
        }
        groupedWorkouts[formattedDate].push(workout);
      });
  
      // Extract and set unique sorted dates
      setWorkoutDays(Object.keys(groupedWorkouts));
    }
  }, [searchMode, availableWorkouts]);
  

  useEffect(() => {
    const filtered = availableWorkouts.map(workout => workout.name).filter(exercise =>
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWorkouts(filtered);
  }, [searchQuery, availableWorkouts]);

  const handleExerciseSelection = (exercise: string) => {
    navigation.navigate('exerciseHistorByName', { exercise });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {searchMode === 'exercise' ? 'Pesquise por treinos anteriores' : 'Histórico de Treinos'}
      </Text>

      {searchMode === 'exercise' && (
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Pesquise por um treino"
        />
      )}

      {searchMode === 'exercise' ? (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exerciseItem} onPress={() => handleExerciseSelection(item)}>
              <Text style={styles.exerciseText}>{item}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>Nenhum exercício encontrado</Text>}
        />
      ) : (
        <FlatList
          data={workoutDays}
          keyExtractor={(item) => item} // Unique date as key
          renderItem={({ item: date }) => (
            <TouchableOpacity
              style={styles.workoutItem}
              onPress={() => navigation.navigate('exerciseHistoryByDays', { date })}
            >
              <Text style={styles.bold}>{date}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>Nenhum treino encontrado</Text>}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={() => setSearchMode(searchMode === 'exercise' ? 'workout' : 'exercise')}>
        <Text style={styles.buttonText}>
          {searchMode === 'exercise' ? 'Pesquise por dia' : 'Pesquise por exercício'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff', marginBottom: 10 },
  exerciseItem: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8, marginVertical: 5 },
  exerciseText: { fontSize: 16 },
  workoutItem: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginVertical: 5, elevation: 3 },
  bold: { fontWeight: 'bold' },
  noResults: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 },
  button: { backgroundColor: '#3b5391', paddingVertical: 12, borderRadius: 8, marginVertical: 15, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PreviousRecords;
