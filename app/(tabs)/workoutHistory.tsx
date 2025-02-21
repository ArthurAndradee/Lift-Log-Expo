import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { getWorkoutsForUser } from '../../constants/api-calls';
import { RootStackParamList, WorkoutResponse } from '../../constants/interfaces';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import dayjs from 'dayjs';
import React from 'react';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PreviousRecords = () => {
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutResponse[]>([]);
  const [searchMode, setSearchMode] = useState<'exercise' | 'workout'>('exercise');
  const [workoutDays, setWorkoutDays] = useState<WorkoutResponse[][]>([]);

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
      const sortedWorkouts = [...availableWorkouts].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      );
      const groupedWorkouts: Record<string, WorkoutResponse[]> = {};
      sortedWorkouts.forEach((workout) => {
        const formattedDate = dayjs(workout.date).format('DD/MM/YYYY');
        if (!groupedWorkouts[formattedDate]) {
          groupedWorkouts[formattedDate] = [];
        }
        groupedWorkouts[formattedDate].push(workout);
      });
      setWorkoutDays(Object.values(groupedWorkouts));
    }
  }, [searchMode, availableWorkouts]);

  useEffect(() => {
    if (searchMode === 'exercise') {
      const uniqueWorkoutsMap = new Map(
        availableWorkouts.map((workout) => [workout.name, workout])
      );
      const uniqueExercises = Array.from(uniqueWorkoutsMap.values());
      const filtered = uniqueExercises.filter((workout) =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWorkouts(filtered);
    }
  }, [searchQuery, availableWorkouts, searchMode]);

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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exerciseItem} 
            onPress={() => navigation.navigate('exerciseHistorByName', { 
              workoutName: item.name, 
              workoutId: item.id 
              })}
            >
              <Text style={styles.exerciseText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>Nenhum exercício encontrado</Text>}
        />
      ) : (
        <FlatList
          data={workoutDays}
          keyExtractor={(item) => item[0].id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutItem}
              onPress={() => navigation.navigate('exerciseHistoryByDays', { 
                date: item[0].date, 
                workoutId: item[0].id
              })}
            >
              <Text style={styles.bold}>{dayjs(item[0].date).format('DD/MM/YYYY')}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noResults}>Nenhum treino encontrado</Text>}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={() => 
        setSearchMode(searchMode === 'exercise' ? 'workout' : 'exercise')}>
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
