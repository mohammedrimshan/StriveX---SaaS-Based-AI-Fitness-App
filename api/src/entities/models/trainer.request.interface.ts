export interface TrainerRequestUser {
    id: string;
    client: string;
    preferences: {
      workoutType?: string;
      fitnessGoal?: string;
      skillLevel?: string;
      skillsToGain: string[];
    };
    matchedTrainers: { id: string; name: string }[];
    selectedTrainer: { id: string; name: string } | null;
    status: string;
  }
  