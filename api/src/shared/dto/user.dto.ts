import { TRole } from "../constants";


export interface AdminDTO {
  adminId?: string; 
  name: string; 
  email: string; 
  password: string; 
  role: "admin"; 
}


export interface ClientDTO {
  userId?: string; 
  firstName: string; 
  lastName: string;
  email: string; 
  phone: string; 
  password: string; 
  role: "user"; 
}


export interface TrainerDTO {
  trainerId?: string; 
  name: string; 
  email: string; 
  phone: string; 
  password: string; 
  experience: number; 
  skills: string[]; 
  status?: "Pending" | "Approved" | "Rejected"; 
  role: "trainer"; 
}


export type UserDTO = AdminDTO | ClientDTO | TrainerDTO;


export interface LoginUserDTO {
  email: string;
  password: string;
  role: TRole; 
}