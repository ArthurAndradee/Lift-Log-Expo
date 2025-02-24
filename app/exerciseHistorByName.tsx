import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getExerciseDetailsForWorkout, getWorkoutsForUser } from '../constants/api-calls';
import { RootStackParamList, WorkoutResponse } from '../constants/interfaces';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';

type RouteParams = {
  workoutDetailsFilteredByDay: { workoutName: string, workoutId: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const WorkoutInstances = () => {
  const route = useRoute<RouteProp<RouteParams, 'workoutDetailsFilteredByDay'>>();
  const { workoutName, workoutId } = route.params;
  const [previousRecord, setPreviousRecord] = useState<WorkoutResponse[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const fetchWorkouts = async () => {
      const availableWorkouts = await getWorkoutsForUser();
      const filteredWorkouts = 
      availableWorkouts.filter((workout: { name: string; }) => workout.name === workoutName);

      setPreviousRecord(filteredWorkouts);
    };
    getExerciseDetailsForWorkout(workoutId);
    fetchWorkouts();
  }, [workoutName]);

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const filteredRecords = previousRecord.filter((record) => {
    const recordDate = new Date(record.date);
    if (startDate && recordDate < startDate) return false;
    if (endDate && recordDate > endDate) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros do treino: {workoutName}</Text>

      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.dateText}>
            {startDate ? startDate.toLocaleDateString('pt-BR') : 'Data inicial'}
          </Text>
        </TouchableOpacity>

        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
          <Text style={styles.dateText}>
            {endDate ? endDate.toLocaleDateString('pt-BR') : 'Data final'}
          </Text>
        </TouchableOpacity>

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>

      {/* Display previous workouts */}
      {filteredRecords.length > 0 ? (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.recordItem}>
              <Text style={styles.recordText}>{formatDate(item.date)}</Text>
              <TouchableOpacity style={styles.detailsButton} 
                onPress={() => navigation.navigate('workoutDetailsFilteredByDay', { workoutId: item.id, workoutName: item.name })}
              >
                <Text style={styles.detailsButtonText}>Ver detalhes</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noResults}>Nenhum treino encontrado.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  recordItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordText: { fontSize: 16, fontWeight: '800', color: '#333' },
  noResults: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 },
  datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  dateButton: {
    backgroundColor: '#3b5391',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: { fontSize: 16, color: '#fff' },
  detailsButton: {
    backgroundColor: '#33a3ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detailsButtonText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
});

export default WorkoutInstances;
