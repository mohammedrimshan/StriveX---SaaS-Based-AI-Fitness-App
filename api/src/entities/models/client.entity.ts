import { IUserEntity } from "./user.entity";

export interface IClientEntity extends IUserEntity {
   clientId: string;
}