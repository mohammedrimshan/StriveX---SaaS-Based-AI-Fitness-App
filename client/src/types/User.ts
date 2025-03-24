import { UserRole } from "./UserRole";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;
  profileImage?: string;
  dateOfBirth?: string; 
  experience?: string;  
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
}

export interface ITrainer extends User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export type UserDTO = IAdmin | IClient | ITrainer;
