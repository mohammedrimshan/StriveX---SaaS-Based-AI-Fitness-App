import { BackupInvitationStatus } from "./backuptrainer";
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
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  
}

export interface ILoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface IAdmin extends User {
  isAdmin?: boolean;
  profileImage?: string;
}


export enum TrainerSelectionStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  NOT_CONFIRMED = "not_confirmed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface IClient extends User {
  id: string;
  clientId?: string;
  isActive?: boolean;
  specialization?: string;
  preferences?: string[];
  status: string;
  googleId?: string;
  fitnessGoal?:
    | "weightLoss"
    | "muscleGain"
    | "endurance"
    | "flexibility"
    | "maintenance";
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  healthConditions?: string[];
  waterIntake?: number;
  waterIntakeTarget?: number;
  dietPreference?: string;
  preferredWorkout?: string;
  workoutExperience?: string;
  profileImage?: string;
  isPremium: boolean;
  selectionMode: string; // or SelectionMode enum
  sleepFrom: string; // or Date if using Date objects
  wakeUpAt: string; // or Date
  skillsToGain: string[]; // or SKILLS[] if using enum
  isOnline: boolean;
  matchedTrainers: string[];
  fcmToken?: string;
  equipmentAvailable?: string[];
  calorieTarget?: string;
  foodAllergies?: string[];
  workoutCategory?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  membershipPlanId?: string;
  selectedTrainerId?: string;
  selectStatus: TrainerSelectionStatus;
  backupTrainerStatus: BackupInvitationStatus;
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
  metValue: number;
  description: string;
  isListed: boolean;
  createdAt: Date;
}


export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  experience: string;
  gender: string;
  skills: string[];
  status: string;
}
export interface IUser extends UserFormData {
  createdAt: Date;
  updatedAt: Date;
}




export interface TrainerInfo {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string[];
  profileImage: string;
  phoneNumber: string;
  email: string;
  experience: number;
  gender: string;
}

export interface ClientTrainersResponse {
  selectedTrainer: TrainerInfo | null;
  backupTrainer: TrainerInfo | null;
}

export type UserDTO = IAdmin | IClient | ITrainer;
