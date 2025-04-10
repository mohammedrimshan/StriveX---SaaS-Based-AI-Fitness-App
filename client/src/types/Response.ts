import { UserRole } from "./UserRole";
import { ITrainer } from "@/types/User";

export interface IAxiosResponse<T = any> {
   success: boolean;
   message: string;
   data: T;
 }

export interface IAuthResponse extends IAxiosResponse {
   user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
      profileImage: string;
      phoneNumber: string;
      isAdmin?:boolean
   }
}

// client\src\types\Response.ts
export interface PaginatedTrainersResponse {
   trainers: ITrainer[];
   totalPages: number;
   currentPage: number;
   totalTrainers: number;
   success: boolean;
   message: string;
 }
 export interface PaginatedTrainersResponse {
   trainers: ITrainer[];
   totalPages: number;
   currentPage: number;
   totalTrainers: number;
   success: boolean;
   message: string;
 }

 export interface PaginatedResponse<T> {
   data: T[];
   page: number;
   limit: number;
   total: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
   success: boolean;
   message: string;
 }