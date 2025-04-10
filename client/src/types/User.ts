import { UserRole } from "./UserRole";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;

  dateOfBirth?: string; 
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
  profileImage?:string
}

export interface IClient extends User{
  id: string;
  clientId?:string;
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
  id: string; 
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  height?: number;
  weight?: number;
  dateOfBirth?: string;
  gender?: string;
  experience?: number;
  skills?: string[];
  qualifications?: string[];
  specialization?: string[];
  certifications?: string[];
  approvedByAdmin?: boolean; 
  approvalStatus?: string; 
  rejectionReason?: string; 
  googleId?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isListed: boolean;
  createdAt: Date;
}


export type UserDTO = IAdmin | IClient | ITrainer;