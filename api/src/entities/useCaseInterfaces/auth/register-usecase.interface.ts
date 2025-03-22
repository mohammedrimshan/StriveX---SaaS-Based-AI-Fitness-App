import { UserDTO } from "@/shared/dto/user.dto";
import { IUserEntity } from "../../models/user.entity";

export interface IRegisterUserUseCase {
	execute(user: UserDTO): Promise<IUserEntity | null>;
}
