import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, Exercise } from '../constants/interfaces';
import { getWorkoutsForUser } from '../constants/api-calls';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ExerciseHistoryByDaysRouteProp = RouteProp<RootStackParamList, 'exerciseHistoryByDays'>;

const ExerciseHistoryByDays = () => {
  const route = useRoute<ExerciseHistoryByDaysRouteProp>();
  const { date } = route.params;
  const [groupedWorkouts, setGroupedWorkouts] = useState<{ [key: string]: Exercise[] }>({});
  const [allWorkouts, setAllWorkouts] = useState<Exercise[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workouts = await getWorkoutsForUser();
        setAllWorkouts(workouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, []);

  // Group workouts by time (HH:mm format) and filter by selected date
  useEffect(() => {
    if (allWorkouts.length > 0) {
      const filteredWorkouts = allWorkouts.filter(workout =>
        dayjs(workout.date).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD')
      );

      const groupedByTime: { [key: string]: Exercise[] } = {};
      filteredWorkouts.forEach(workout => {
        const timeKey = dayjs(workout.date).format('HH:mm');
        if (!groupedByTime[timeKey]) {
          groupedByTime[timeKey] = [];
        }
        groupedByTime[timeKey].push(workout);
      });

      setGroupedWorkouts(groupedByTime);
    }
  }, [allWorkouts, date]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercícios de {dayjs(date).format('DD/MM/YYYY')}</Text>
      <FlatList
        data={Object.entries(groupedWorkouts)}
        keyExtractor={([time]) => time}
        renderItem={({ item: [time, exercises] }) => (
          <TouchableOpacity style={styles.workoutContainer} 
          onPress={() => navigation.navigate('workoutDetailsFilteredByDay', { workoutId: exercises[0].id, workoutName: exercises[0].name })}
          >
            <Text style={styles.time}>{exercises[0].name}</Text>
            {exercises.map((exercise) => (
              <Text key={exercise.id} style={styles.exerciseText}>
                {time}
              </Text>
            ))}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  workoutContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  exerciseText: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default ExerciseHistoryByDays;
