import { UserRole } from "./UserRole";

export interface IAxiosResponse {
   success: boolean;
   message: string;
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