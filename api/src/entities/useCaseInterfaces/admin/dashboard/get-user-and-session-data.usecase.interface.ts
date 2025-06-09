import { IUserAndSessionData } from "@/entities/models/admin-dashboard.entity";

export interface IGetUserAndSessionDataUseCase {
  execute(year: number, type?: "daily" | "weekly"): Promise<IUserAndSessionData>;
}