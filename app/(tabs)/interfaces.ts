export interface Set {
    setNumber: number;
    reps:number;
    weight: number;
  }
  
export interface WorkoutRecord {
  date: string;
  exercise: string;
  reps: number;
  setNumber: number;
  weight: number;
  workoutId: number;
  sets: Set[];
}

export type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  WorkoutContainer: undefined;
  PreviousRecords: undefined;
  LogExisting: undefined;
  LogNew: undefined;
};