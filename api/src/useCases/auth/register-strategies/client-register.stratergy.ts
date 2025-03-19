import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategy.interface";
import { ClientDTO, UserDTO } from "@/shared/dto/user.dto";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { IBcrypt } from "@/frameworks/security/bcrypt.interface";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
import { IUserEntity } from "@/entities/models/user.entity";

@injectable()
export class ClientRegisterStrategy implements IRegisterStrategy {
  constructor(
    @inject("IClientRepository") private userRepository: IClientRepository,
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
  ) {}

  async register(user: UserDTO): Promise<IUserEntity | void> {
    if (user.role === "client") {
      const existingUser = await this.userRepository.findByEmail(user.email);
      if (existingUser) {
        throw new CustomError(
          ERROR_MESSAGES.EMAIL_EXISTS,
          HTTP_STATUS.CONFLICT
        );
      }

      const { firstName, lastName, email, phoneNumber, password } = user as ClientDTO;

      let hashedPassword = null;
      if (password) {
        hashedPassword = await this.passwordBcrypt.hash(password);
      }

      const clientId = generateUniqueId("client");

      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword ?? "",
        clientId,
        role: "client",
      });
    } else {
      throw new CustomError(
        "Invalid role for user registration",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}
