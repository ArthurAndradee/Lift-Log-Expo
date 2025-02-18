export interface Set {
    setNumber: number;
    reps:number;
    weight: number;
}
  
export interface Exercise {
  date: string;
  name: string;
  reps: number;
  setNumber: number;
  weight: number;
  exerciseId: number;
  sets: Set[];
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
  workoutCreator: undefined;
  workoutHistory: undefined;
  userRegistration: undefined;
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