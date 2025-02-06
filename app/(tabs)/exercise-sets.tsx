import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Alert, SectionList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { fetchPreviousRecords, deleteWorkout } from './api-calls';
import { WorkoutRecord } from './interfaces';
import DateTimePicker from '@react-native-community/datetimepicker';

type RouteParams = {
  ExerciseSets: { exercise: string };
};

const ExerciseSets = () => {
  const route = useRoute<RouteProp<RouteParams, 'ExerciseSets'>>();
  const { exercise } = route.params;
  const [previousRecord, setPreviousRecord] = useState<WorkoutRecord[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    fetchPreviousRecords(exercise, setPreviousRecord);
  }, [exercise]);

  const handleDeleteWorkout = async (workoutId: number) => {
    const isDeleted = await deleteWorkout(workoutId);
    if (isDeleted) {
      fetchPreviousRecords(exercise, setPreviousRecord);
    } else {
      Alert.alert('Error', 'Failed to delete workout');
    }
  };

  // Handle start date change
  const handleStartDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  // Handle end date change
  const handleEndDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  // Filter records based on date range
  const filteredRecords = previousRecord.filter((record) => {
    const recordDate = new Date(record.date);
    if (startDate && recordDate < startDate) return false;  // Before start date
    if (endDate && recordDate > endDate) return false;  // After end date
    return true;
  });

  // Group records by workoutId and date
  const groupedRecords = filteredRecords.reduce((acc, item) => {
    const date = new Date(item.date).toLocaleDateString(); // Format date
    if (!acc[item.workoutId]) {
      acc[item.workoutId] = { workoutId: item.workoutId, date, records: [] };
    }
    acc[item.workoutId].records.push(item);
    return acc;
  }, {} as Record<number, { workoutId: number, date: string, records: WorkoutRecord[] }>);

  // Convert grouped records into a format suitable for SectionList
  const sections = Object.keys(groupedRecords)
  .map((key) => ({
    title: groupedRecords[+key].date,
    data: groupedRecords[+key].records,
    workoutId: +key,
  }))
  .reverse(); // This reverses the order of the sections

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previous Records for {exercise}</Text>

      {/* Date Pickers */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.dateText}>
            {startDate ? startDate.toLocaleDateString() : 'Select Start Date'}
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
            {endDate ? endDate.toLocaleDateString() : 'Select End Date'}
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.workoutId.toString()}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text style={styles.recordText}>
              <Text style={styles.bold}>{item.exercise}</Text> - Set {item.setNumber}, 
              Weight: {item.weight} kgs, 
              {item.reps !== null ? ` Reps: ${item.reps}` : ' Reps: N/A'}
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWorkout(section.workoutId)}
            >
              <Text style={styles.deleteButtonText}>Delete Sets</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No records found for this exercise.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  recordItem: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginVertical: 5, elevation: 3 },
  recordText: { fontSize: 16 },
  bold: { fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#ff4d4d', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  noResults: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 10 },
  sectionHeader: { backgroundColor: '#f0f0f0', paddingVertical: 10, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  dateButton: {
    backgroundColor: '#3b5391',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: { fontSize: 16, color: '#fff' },
});

export default ExerciseSets;