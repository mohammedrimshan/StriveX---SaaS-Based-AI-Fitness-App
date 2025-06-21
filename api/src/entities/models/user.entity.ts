import { TRole } from "../../shared/constants";

export interface IUserEntity {
  clientId: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: TRole;
  profileImage?: string;
  height?: number;
  weight?: number;
  status?: string;
  isOnline: boolean;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
