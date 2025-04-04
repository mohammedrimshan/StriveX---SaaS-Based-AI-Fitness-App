export interface IProgressEntity {
    _id?: string;
    clientId: string;
    workoutId: string;
    completedDuration: number;
    customSessions: Array<{
      exerciseDuration: number;
      restDuration: number;
    }>;
    date: string;
    caloriesBurned?: number;
  }