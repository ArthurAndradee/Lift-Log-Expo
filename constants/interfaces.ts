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
  exerciseHistorByName: { exercise: string };
  exerciseHistoryByDays: { date: string };
  registerExistingExercise: undefined;
  registerExistingWorkout: undefined;
  workoutCreator: undefined;
  workoutHistory: undefined;
  userRegistration: undefined;
  workoutDetails: { workoutName: string };
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

export interface WorkoutReponse {
  id: number;
  name: string;
  date: string;
}