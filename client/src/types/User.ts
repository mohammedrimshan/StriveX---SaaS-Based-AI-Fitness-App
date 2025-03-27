import { UserRole } from "./UserRole";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;

  dateOfBirth?: string; 
  experience?: string; 
  height?: number;
  weight?: number;
  gender?: string;      
	status: string;
	createdAt: Date;
	updatedAt: Date;
  isActive?: boolean;
}

export interface ILoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface IAdmin extends User {
	isAdmin?: boolean;
}

export interface IClient extends User{
  id: string;
  isActive?: boolean;
  specialization?: string;
  preferences?: string[];
  status: string;
  googleId?: string;
  fitnessGoal?: "weightLoss" | "muscleGain" | "endurance" | "flexibility" | "maintenance";
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  healthConditions?: string[];
  waterIntake?: number;
  dietPreference?: string;
  preferredWorkout?:string;
  workoutExperience?:string;
  profileImage?: string;
}

export interface ITrainer extends User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export type UserDTO = IAdmin | IClient | ITrainer;
