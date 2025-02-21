import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Set, Exercise, ExistingWorktoutExercise, WorkoutReponse } from "./interfaces";
import { Alert } from "react-native";

export const API_BASE_URL = "http://10.0.2.2:5000";

export const addSet = (
  sets: Set[],
  setWeight: number,
  setReps: number,
  setSets: (newSets: Set[]) => void
) => {
  if (setWeight > 0 && setReps > 0) {
    const newSet: Set = {
      setNumber: sets.length + 1,
      weight: setWeight,
      reps: setReps,
    };
    setSets([...sets, newSet]);
    return { valid: true };
  }
  return {
    valid: false,
    message: "Please enter valid weight and reps for the set.",
  };
};

export const getExercisesNames = async (setAvailableExercises: (exercises: string[]) => void) => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    console.error("User is not authenticated.");
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/workouts/exercises`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAvailableExercises(response.data.exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
  }
};

export const createWorkout = async (workoutName: string) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await axios.post(`${API_BASE_URL}/api/workouts/create` , { userId, workoutName }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;  
  } catch (error) {
    console.error('Error creating workout:', error);
    throw error;
  }
};

export const logExercise = async (exercise: string, sets: Set[], workoutId: number | null) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  if (!token || !userId) {
    alert("User is not authenticated.");
    return { logged: false, exerciseId: null };
  }

  if (!exercise) {
    alert("Please select an exercise.");
    return { logged: false, exerciseId: null };
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/workouts/log`, { userId, exercise, sets, workoutId }, {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return { logged: true, exerciseId: response.data.exerciseId };
  } catch (error) {
    console.error("Failed to log workout:", error);
    return { logged: false, exerciseId: null };
  }
};

export const fetchExerciseInfo = async (exercise: string, setPreviousRecord: (records: Exercise[]) => void) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");
  
  if (!token || !userId) {
    Alert.alert("User is not authenticated.");
    return;
  }
  
  try {
    setPreviousRecord([]);
    const response = await axios.get(`${API_BASE_URL}/api/workouts/records/${userId}/${exercise}`, {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setPreviousRecord(response.data);
  } catch (error) {
    console.error("Error fetching previous records:", error);
  }
};

export const fetchAllExercisesInfo = async (setPreviousRecord: (records: Exercise[]) => void) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  if (!token || !userId) {
    Alert.alert("User is not authenticated.");
    return;
  }

  try {
    setPreviousRecord([]);
    const response = await axios.get(`${API_BASE_URL}/api/workouts/records/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPreviousRecord(response.data);
  } catch (error) {
    console.error("Error fetching previous records:", error);
  }
};

export const deleteExercise = async (workoutId: number) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  if (!token || !userId) {
    console.error("User is not authenticated.");
    return false;
  }

  try {
    await axios.delete(`${API_BASE_URL}/api/workouts/delete`, {
      data: { userId, workoutId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error("Error deleting workout:", error);
    return false;
  }
};

export const getWorkoutsForUser = async () => {
  const userId = await AsyncStorage.getItem("userId");
  const token = await AsyncStorage.getItem("token");
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workouts/workouts/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return (response.data.workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
};

export const getExerciseNamesForWorkout = async (workoutName: string, setWorkoutExercises: (exercises: string[]) => void) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/workouts/workout/exercises/${userId}/${workoutName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setWorkoutExercises(response.data.exercises);
  } catch (error) {
    console.error('Error fetching exercise names:', error);
    throw error;
  }
};

// THIS ONE LEFT
export const getExerciseDetailsForWorkout = async (workoutName: string) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await axios.get(`${API_BASE_URL}/api/workouts/workout/exercise-details/${userId}/${workoutName}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    //{"details": [{"exercise": "Arremesso de espada", "id": 23, "reps": 13, "setNumber": 1, "weight": "31.00"}, {"exercise": "Levantamento de bola de canhao", "id": 24, "reps": 12, "setNumber": 1, "weight": "21.00"}, {"exercise": "Puxada de barril", "id": 25, "reps": 14, "setNumber": 1, "weight": "41.00"}, {"exercise": "Arremesso de espada", "id": 23, "reps": 31, "setNumber": 2, "weight": "13.00"}, {"exercise": "Levantamento de bola de canhao", "id": 24, "reps": 21, "setNumber": 2, "weight": "12.00"}, {"exercise": "Puxada de barril", "id": 25, "reps": 41, "setNumber": 2, "weight": "14.00"}]}
    console.log(response.data)

    return response.data;
  } catch (error) {
    console.error('Error fetching exercise details:', error);
    throw error;
  }
};

export const createExerciseForWorkout = async (workoutName: string, exerciseData: ExistingWorktoutExercise) => {
  const token = await AsyncStorage.getItem("token");
  const userId = await AsyncStorage.getItem("userId");

  try {
    const response = await axios.post(`${API_BASE_URL}/api/workouts/workout/exercise/${userId}/${workoutName}/`, exerciseData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};
