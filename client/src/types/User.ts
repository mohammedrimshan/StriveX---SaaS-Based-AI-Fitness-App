import { UserRole } from "./UserRole";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role?: UserRole;
}

export interface ILoginData {
  email: string;
  password: string;
  role: UserRole;
}

export interface IAdmin {
  email: string;
  password: string;
  role: "admin";
}

export interface IClient {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "client";
}

export interface ITrainer {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: "trainer";
}

export type UserDTO = IAdmin | IClient | ITrainer;
