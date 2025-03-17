import { IUserEntity } from "./user.entity";

export interface IAdminEntity extends IUserEntity {
    clientId: string;
    isAdmin:boolean;
}