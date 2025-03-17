import { IClientEntity } from "../../models/client.entity";

export interface IClientRepository{
    save(data:Partial<IClientEntity>):Promise<IClientEntity>;
    findByEmail(email:string):Promise<IClientEntity|null>;
    findById(id: any): Promise<IClientEntity | null>;
    updateByEmail(
		email: string,
		updates: Partial<IClientEntity>
	): Promise<IClientEntity | null>;
	findByIdAndUpdateStatus(id: any, status: string): Promise<void>;
}