export interface IWorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  duration?: string;
  restTime?: string;
  notes?: string;
}

export interface IWorkoutDay {
  day: string;
  focus: string;
  exercises: IWorkoutExercise[];
  warmup?: string;
  cooldown?: string;
}

export interface IWorkoutPlan {
  id: string;
  clientId: string;
  title: string;
  description: string;
  weeklyPlan: IWorkoutDay[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}