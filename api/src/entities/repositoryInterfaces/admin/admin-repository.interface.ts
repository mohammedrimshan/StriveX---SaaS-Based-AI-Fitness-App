import { IAdminEntity } from "@/entities/models/admin.entity";
import { IBaseRepository } from "../base-repository.interface";
export interface IAdminRepository extends IBaseRepository<IAdminEntity>{
	findByEmail(email: string): Promise<IAdminEntity | null>;
	updateByEmail(
		email: string,
		updates: Partial<IAdminEntity>
	): Promise<IAdminEntity | null>;
}
