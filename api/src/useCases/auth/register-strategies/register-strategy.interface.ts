import { IUserEntity } from "../../../entities/models/user.entity";
import { UserDTO } from "../../../shared/dto/user.dto";

export interface IRegisterStrategy {
  register(user: UserDTO): Promise<IUserEntity | null>;
}