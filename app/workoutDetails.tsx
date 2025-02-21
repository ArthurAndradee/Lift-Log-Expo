import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getExerciseDetailsForWorkout } from '../constants/api-calls';
import { Exercise } from '../constants/interfaces';
import React from 'react';

type RouteParams = {
  workoutDetails: { workoutName: string };
};

const WorkoutDetails = () => {
  const route = useRoute<RouteProp<RouteParams, 'workoutDetails'>>();
  const navigation = useNavigation();
  const { workoutName } = route.params;
  const [groupedExercises, setGroupedExercises] = useState<Record<number, Exercise[]>>({});

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await getExerciseDetailsForWorkout(workoutName);

        // Group exercises by ID
        const grouped = response.details.reduce((acc: Record<number, Exercise[]>, exercise: Exercise) => {
          if (!acc[exercise.id]) {
            acc[exercise.id] = [];
          }
          acc[exercise.id].push(exercise);
          return acc;
        }, {});

        setGroupedExercises(grouped);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      }
    };

    fetchExercises();
  }, [workoutName]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workoutName}</Text>

      {Object.keys(groupedExercises).length > 0 ? (
        <FlatList
          data={Object.entries(groupedExercises)}
          keyExtractor={([id]) => id}
          renderItem={({ item }) => {
            const [id, exercises] = item;
            return (
              <View style={styles.exerciseGroup}>
                <Text style={styles.exerciseName}>{exercises[0].name}</Text>
                {exercises.map((set) => (
                  <View key={`${set.id}-${set.setNumber}`} style={styles.exerciseCard}>
                    <Text style={styles.exerciseText}>Série: {set.setNumber}</Text>
                    <Text style={styles.exerciseText}>Reps: {set.reps}</Text>
                    <Text style={styles.exerciseText}>Peso: {set.weight} kg</Text>
                  </View>
                ))}
              </View>
            );
          }}
        />
      ) : (
        <Text style={styles.noExercises}>Nenhum exercício encontrado.</Text>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  exerciseGroup: { marginBottom: 15 },
  exerciseCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    elevation: 3,
  },
  exerciseName: { fontSize: 18, fontWeight: 'bold', color: '#3b5391', marginBottom: 5 },
  exerciseText: { fontSize: 16, color: '#333' },
  noExercises: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 },
  backButton: {
    marginTop: 20,
    backgroundColor: '#f6461f',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
});

export default WorkoutDetails;
