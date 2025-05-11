export const WORKOUT_TYPES = [
    "Yoga",
    "Cardio",
    "WeightTraining",
    "Meditation",
    "Calisthenics",
    "Pilates",
    "General",
  ] as const;
  export type WorkoutType = typeof WORKOUT_TYPES[number];