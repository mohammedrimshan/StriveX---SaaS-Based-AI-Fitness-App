import { IUserEntity } from "./user.entity";
import { FitnessGoal } from "@/shared/constants";
import { ExperienceLevel } from "@/shared/constants";
import { ActivityLevel } from "@/shared/constants";


export interface IClientEntity extends IUserEntity {
    googleId?: string;
    fitnessGoal?:FitnessGoal;
    experienceLevel?:ExperienceLevel;
    preferredWorkout?:string;
    activityLevel?:ActivityLevel;
    healthConditions?:string[];
    waterIntake?:number;
    dietPreference?: string;
    equipmentAvailable?:string[];
    calorieTarget?:string;
    foodAllergies?:string[];
    workoutCategory?: string;
    isPremium?: boolean;
}