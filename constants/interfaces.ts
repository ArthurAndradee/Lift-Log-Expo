export interface Set {
  setNumber: number;
  reps:number;
  weight: number;
}
  
export interface Exercise {
  id: number; 
  date: string;
  name: string;
  reps: number;
  setNumber: number;
  weight: number;
}

export interface ExistingWorktoutExercise {
  name: string;
  sets: Set[];
}

export type RootStackParamList = {
  createExercise: undefined;
  createWorkout: undefined;
  index: undefined;
  exerciseHistorByName: { workoutName: string, workoutId: number };
  exerciseHistoryByDays: { date: string, workoutId: number };
  registerExistingExercise: undefined;
  registerExistingWorkout: undefined;
  workoutCreator: undefined;
  workoutHistory: undefined;
  userRegistration: undefined;
  workoutDetails: { workoutId: number, workoutName: string };
};

export interface LoginResponse {
  data: {
    token: string;
    userId: number;
    username: string;
    email: string;
    profilePicture: Blob;
  };
}

export interface WorkoutResponse {
  id: number;
  name: string;
  date: string;
}