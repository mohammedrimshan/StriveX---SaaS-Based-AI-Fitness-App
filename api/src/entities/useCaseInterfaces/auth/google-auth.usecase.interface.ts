import { IUserEntity } from "@/entities/models/user.entity";
import { TRole } from "@/shared/constants";

export interface IGoogleUseCase {
	execute(
		credential: string,
		client_id: string,
		role: TRole
	): Promise<Partial<IUserEntity>>;
}
