import { TRole } from "../../shared/constants";

export interface IUserEntity {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  role: TRole;
  profileImage?: string;
  height?: number;
  weight?: number;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
