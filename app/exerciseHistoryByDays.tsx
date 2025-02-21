import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, Exercise } from '../constants/interfaces';
import { deleteExercise } from '../constants/api-calls';
import dayjs from 'dayjs';
import React from 'react';
import { getWorkoutsForUser } from '../constants/api-calls';  // Import your function

type ExerciseHistoryByDaysRouteProp = RouteProp<RootStackParamList, 'exerciseHistoryByDays'>;

const ExerciseHistoryByDays = () => {
  const route = useRoute<ExerciseHistoryByDaysRouteProp>();
  const { date } = route.params;
  const [groupedWorkouts, setGroupedWorkouts] = useState<{ [key: string]: Exercise[] }>({});
  const [allWorkouts, setAllWorkouts] = useState<Exercise[]>([]); // Store all workouts

  // Fetch workouts for the user
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workouts = await getWorkoutsForUser(); // Fetch workouts for the user
        setAllWorkouts(workouts); // Set all workouts in the state
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, []);

  // Group workouts by date and time
  useEffect(() => {
    if (allWorkouts.length === 0) return; // Do nothing if there are no workouts

    // Filter workouts by the selected date
    const filtered = allWorkouts.filter(
      (workout) => dayjs(workout.date).format('DD/MM/YYYY') === date
    );

    // Group workouts by time (HH:mm format)
    const grouped = filtered.reduce((acc, workout) => {
      const formattedTime = dayjs(workout.date).format('HH:mm'); // Convert time to "HH:mm"
      if (!acc[formattedTime]) {
        acc[formattedTime] = [];
      }
      acc[formattedTime].push(workout);
      return acc;
    }, {} as { [key: string]: Exercise[] });

    setGroupedWorkouts(grouped);
  }, [allWorkouts, date]); // Re-run whenever allWorkouts or date changes

  const handleDeleteExercise = async (workoutId: number) => {
    const isDeleted = await deleteExercise(workoutId);
    if (isDeleted) {
      // Refresh workouts after deletion
      setAllWorkouts((prevWorkouts) => prevWorkouts.filter((workout) => workout.id !== workoutId));
    } else {
      Alert.alert('Error', 'Failed to delete workout');
    }
  };

  console.log(groupedWorkouts);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercícios de {date}</Text>
      <FlatList
        data={Object.entries(groupedWorkouts)}
        keyExtractor={([time]) => time}
        renderItem={({ item: [time, items] }) => (
          <View style={styles.workoutGroup}>
            <View style={styles.groupTitleContainer}>
              <Text style={styles.groupTitle}>{items[0].exercise}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            {items.map((item) => (
              <View key={`${item.name}-${item.setNumber}`} style={styles.workoutItem}>
                <Text style={[styles.boldText, styles.itemFont]}>Set {item.setNumber} - </Text>
                <Text style={styles.itemFont}>Peso: <Text style={styles.boldText}>{item.weight}kg</Text> | </Text>
                <Text style={styles.itemFont}>Reps: {item.reps}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteExercise(items[0].id)}
            >
              <Text style={styles.deleteButtonText}>Deletar Set</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  workoutGroup: { marginBottom: 15, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8 },
  groupTitleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  groupTitle: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  boldText: { fontWeight: 'bold' },
  itemFont: { fontSize: 18 },
  workoutItem: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginVertical: 5, elevation: 3, flexDirection: 'row', flexWrap: 'wrap' },
  deleteButton: { backgroundColor: '#ff4d4d', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default ExerciseHistoryByDays;
