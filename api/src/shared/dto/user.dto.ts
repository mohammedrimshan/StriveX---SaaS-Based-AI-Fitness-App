import { TRole } from "../constants";
import { TrainerApprovalStatus } from "@/shared/constants";
import { Gender } from "../constants";

export interface AdminDTO {
  adminId?: string; 
  firstName: string; 
  lastName: string; 
  email: string; 
  password: string; 
  role: "admin"; 
}


export interface ClientDTO {
  userId?: string; 
  firstName: string; 
  lastName: string;
  email: string; 
  phoneNumber: string; 
  password: string; 
  role: "client"; 
  googleId?: string;
}


export interface TrainerDTO {
  trainerId?: string; 
  googleId?: string;
  firstName: string; 
  lastName: string;  
  email: string;
  phoneNumber?: string;
  password?: string;
  experience?: number;
  dateOfBirth?:string;
  skills?: string[];
  gender?:Gender
  status?: TrainerApprovalStatus; 
  role: "trainer";
}


export type UserDTO = AdminDTO | ClientDTO | TrainerDTO;


export interface LoginUserDTO {
  email: string;
  password: string;
  role: TRole; 
}