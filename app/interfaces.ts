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

export type RootStackParamList = {
  index: undefined;
  welcome: undefined;
  previousRecords: undefined;
  workoutContainer: undefined;
  logExercise: undefined;
  createExercise: undefined;
  createWorkout: undefined;
  exerciseSets: { exercise: string };
  workoutDetails: { date: string };
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