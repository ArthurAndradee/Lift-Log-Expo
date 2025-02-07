import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Set, WorkoutRecord } from './interfaces';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://lift-log-backend.onrender.com';

export const fetchExercises = async (setAvailableExercises: (exercises: string[]) => void) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    console.error('User is not authenticated.');
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAvailableExercises(response.data.exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
  }
};

export const addSet = (
  sets: Set[],
  setWeight: number,
  setReps: number,
  setSets: (newSets: Set[]) => void
) => {
  if (setWeight > 0 && setReps > 0) {
    const newSet: Set = { setNumber: sets.length + 1, weight: setWeight, reps: setReps };
    setSets([...sets, newSet]);
    return { valid: true };
  }
  return { valid: false, message: 'Please enter valid weight and reps for the set.' };
};

export const logWorkout = async (exercise: string, sets: Set[]) => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');

  if (!token || !userId) {
    alert('User is not authenticated.');
    return { logged: false };
  }

  if (!exercise) {
    alert('Please select an exercise.');
    return { logged: false };
  }

  try {
    await axios.post( `${API_BASE_URL}/log`,{ userId, exercise, sets },{ 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    return { logged: true };
  } catch (error) {
    console.error('Failed to log workout:', error);
    return { logged: false };
  }
};

export const fetchPreviousRecords = async (
  exercise: string,
  setPreviousRecord: (records: WorkoutRecord[]) => void
) => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');

  if (!token || !userId) {
    Alert.alert('User is not authenticated.');
    return;
  }

  try {
    setPreviousRecord([]);
    const response = await axios.get(`${API_BASE_URL}/records/${userId}/${exercise}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Data: " + userId + " " + exercise);  
    setPreviousRecord(response.data);
  } catch (error) {
    console.error('Error fetching previous records:', error);
  }
};

export const fetchAllWorkouts = async (
  setPreviousRecord: (records: WorkoutRecord[]) => void
) => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');

  if (!token || !userId) {
    Alert.alert('User is not authenticated.');
    return;
  }

  try {
    setPreviousRecord([]);
    const response = await axios.get(`${API_BASE_URL}/records/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }); 
    setPreviousRecord(response.data);
  } catch (error) {
    console.error('Error fetching previous records:', error);
  }
};

export const deleteWorkout = async (workoutId: number) => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');

  if (!token || !userId) {
    console.error('User is not authenticated.');
    return false;
  }

  try {
    await axios.delete(`${API_BASE_URL}/delete`, {
      data: { userId, workoutId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    return false;
  }
};