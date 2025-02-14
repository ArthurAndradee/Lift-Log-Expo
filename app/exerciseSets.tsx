import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Alert, SectionList, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { fetchPreviousRecords, deleteWorkout } from './api-calls';
import { Exercise } from './interfaces';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';

type RouteParams = {
  ExerciseSets: { exercise: string };
};

const ExerciseSets = () => {
  const route = useRoute<RouteProp<RouteParams, 'ExerciseSets'>>();
  const { exercise } = route.params;
  const [previousRecord, setPreviousRecord] = useState<Exercise[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    fetchPreviousRecords(exercise, setPreviousRecord);
    console.log(previousRecord)
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

// Group records by workoutId and combine date with time
const groupedRecords = filteredRecords.reduce((acc, item) => {
  const dateObj = new Date(item.date);
  const date = dateObj.toLocaleDateString(); 
  // Format time as "HH:MM"
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateTime = `${date} - ${time}`;

  if (!acc[item.exerciseId]) {
    acc[item.exerciseId] = { workoutId: item.exerciseId, dateTime, records: [] };
  }
  acc[item.exerciseId].records.push(item);
  return acc;
}, {} as Record<number, { workoutId: number, dateTime: string, records: Exercise[] }>);

// Convert grouped records into a format suitable for SectionList
const sections = Object.keys(groupedRecords)
  .map((key) => ({
    title: groupedRecords[+key].dateTime, // Combined date and time here
    data: groupedRecords[+key].records,
    workoutId: +key,
  }))
  .reverse(); // Reverse the order of the sections if needed

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros de {exercise}</Text>

      {/* Date Pickers */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.dateText}>
            {startDate ? startDate.toLocaleDateString() : 'Data inicial'}
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
            {endDate ? endDate.toLocaleDateString() : 'Data final'}
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
        keyExtractor={(item) => item.exerciseId.toString()}
        renderItem={({ item, index, section }) => (
          <View>
            <View style={styles.recordItem}>
              <Text style={styles.recordText}>
                <Text style={styles.bold}>Set {item.setNumber} - </Text> 
                Peso: <Text style={styles.bold}>{item.weight}</Text> kg | 
                {item.reps !== null ? ` Reps: ${item.reps}` : ' Reps: N/A'}
              </Text>
            </View>
        
            {index === section.data.length - 1 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteWorkout(section.workoutId)}
              >
                <Text style={styles.deleteButtonText}>Deletar Sets</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        renderSectionHeader={({ section }) => {
          const firstRecord = section.data[0]; // Get first record in the section
          const recordDate = new Date(firstRecord.date);
        
          // Format Date as DD/MM/YYYY with leading zeros
          const formattedDate = recordDate.toLocaleDateString('en-GB', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
          });
        
          // Format Time in 24-hour format (HH:mm)
          const formattedTime = recordDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', minute: '2-digit', hour12: false 
          });
        
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{formattedDate}</Text>
              <Text style={styles.sectionTime}>{formattedTime}</Text>
            </View>
          );
        }}
        
        ListEmptyComponent={<Text style={styles.noResults}>Nenhum registro encontrado</Text>}
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
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space between date and time
    alignItems: 'center', // Center vertically
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  sectionTime: {
    fontSize: 16,
    color: '#555',
  },
});

export default ExerciseSets;