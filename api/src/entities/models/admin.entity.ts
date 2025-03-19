import { IUserEntity } from "./user.entity";

export interface IAdminEntity extends IUserEntity {
   
    isAdmin:boolean;
}