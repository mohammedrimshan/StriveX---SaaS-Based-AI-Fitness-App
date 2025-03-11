import { IUserEntity } from "../../models/user.entity";

export interface IRegisterUserUseCase {
	execute(user: Partial<IUserEntity>): Promise<void>;
}
