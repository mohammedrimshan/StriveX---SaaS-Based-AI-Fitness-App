import { IUserEntity } from "./user.entity";
import { ExperienceLevel, FitnessGoal, ActivityLevel, Skill, TrainerSelectionStatus, WorkoutType } from "@/shared/constants";

export interface IClientEntity extends IUserEntity {
  fcmToken?: string;
  googleId?: string;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  preferredWorkout?: WorkoutType;
  activityLevel?: ActivityLevel;
  healthConditions?: string[];
  waterIntake?: number;
  dietPreference?: string;
  equipmentAvailable?: string[];
  calorieTarget?: string;
  foodAllergies?: string[];
  workoutCategory?: string;
  isPremium?: boolean;
  sleepFrom?: string; 
  wakeUpAt?: string;
  skillsToGain: Skill[]; 
  selectionMode?: "auto" | "manual"; 
  matchedTrainers?: string[];
  selectedTrainerId?: string;
  selectStatus: TrainerSelectionStatus;
}