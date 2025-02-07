import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, WorkoutRecord } from './interfaces';
import { fetchAllWorkouts } from './api-calls';
import dayjs from 'dayjs';

type WorkoutDetailsScreenRouteProp = RouteProp<RootStackParamList, 'workoutDetails'>;

const WorkoutDetailsScreen = () => {
  const route = useRoute<WorkoutDetailsScreenRouteProp>();
  const { date } = route.params;
  const [groupedWorkouts, setGroupedWorkouts] = useState<{ [key: string]: WorkoutRecord[] }>({});

  useEffect(() => {
    fetchAllWorkouts((allWorkouts) => {
      // Filter workouts by date
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
      }, {} as { [key: string]: WorkoutRecord[] });

      setGroupedWorkouts(grouped);
    });
  }, [date]);

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
              <View key={`${item.exercise}-${item.setNumber}`} style={styles.workoutItem}>
                <Text style={styles.boldText}>Set {item.setNumber} - </Text>
                <Text>Peso: <Text style={styles.boldText}>{item.weight}kg</Text> | </Text>
                <Text>Reps: {item.reps}</Text>
              </View>
            ))}
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
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#555' },  // Style for the time text
  boldText: { fontWeight: 'bold' },
  workoutItem: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginVertical: 5, elevation: 3, flexDirection: 'row', flexWrap: 'wrap' },
});

export default WorkoutDetailsScreen;
