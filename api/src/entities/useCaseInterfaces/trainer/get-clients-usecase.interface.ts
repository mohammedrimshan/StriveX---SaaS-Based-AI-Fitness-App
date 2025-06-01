export interface IGetTrainerClientsUseCase {
  execute(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{
    user: Array<{
      id: string;
      clientId: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
      profileImage?: string;
      fitnessGoal?: string;
      experienceLevel?: string;
      preferredWorkout?: string;
      selectStatus: string;
      createdAt: Date;
      updatedAt: Date;
      height?: number;
      weight?: number;
      status?: string;
      googleId?: string;
      activityLevel?: string;
      healthConditions?: string[];
      waterIntake?: number;
      dietPreference?: string;
      isPremium?: boolean;
      sleepFrom?: string;
      wakeUpAt?: string;
      skillsToGain: string[];
      selectionMode?: string;
      matchedTrainers?: string[];
      
    }>;
    total: number;
  }>;
}