import { IUserEntity } from "./user.entity";
import {
  ExperienceLevel,
  FitnessGoal,
  ActivityLevel,
  Skill,
  TrainerSelectionStatus,
  WorkoutType,
  BackupInvitationStatus,
} from "@/shared/constants";

export interface IClientEntity extends IUserEntity {
  
  googleId?: string;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  preferredWorkout?: WorkoutType;
  activityLevel?: ActivityLevel;
  healthConditions?: string[];
  waterIntake?: number;
  waterIntakeTarget?: number;
  dietPreference?: string;
  equipmentAvailable?: string[];
  calorieTarget?: string;
  foodAllergies?: string[];
  workoutCategory?: string;
  isPremium?: boolean;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  membershipPlanId?: string;
  sleepFrom?: string;
  wakeUpAt?: string;
  skillsToGain: Skill[];
  selectionMode?: "auto" | "manual";
  matchedTrainers?: string[];
  selectedTrainerId?: string;
  previousTrainerId?: string; 
  selectStatus: TrainerSelectionStatus;
  backupTrainerId?: string | null;
  backupTrainerStatus?: BackupInvitationStatus | null;
  backupTrainer?: {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  specialization?: string[];
} | null;
}
