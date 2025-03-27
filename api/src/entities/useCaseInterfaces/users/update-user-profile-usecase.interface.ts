import { IClientEntity } from "../../models/client.entity";

export interface IUpdateUserProfileUseCase {
  execute(userId: string, data: Partial<IClientEntity>): Promise<IClientEntity>;
}