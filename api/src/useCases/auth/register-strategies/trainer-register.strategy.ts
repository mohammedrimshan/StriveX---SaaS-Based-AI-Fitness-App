import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategy.interface";
import { TrainerDTO, UserDTO } from "@/shared/dto/user.dto";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { IBcrypt } from "@/frameworks/security/bcrypt.interface";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
import { IUserEntity } from "@/entities/models/user.entity";

@injectable()
export class TrainerRegisterStrategy implements IRegisterStrategy {
  constructor(
    @inject("ITrainerRepository") private userRepository: ITrainerRepository,
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
  ) {}

  async register(user: UserDTO): Promise<IUserEntity | void> {
    if (user.role !== "trainer") {
      throw new CustomError(
        "Invalid role for user registration",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingTrainer = await this.userRepository.findByEmail(user.email);
    if (existingTrainer) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const { firstName, lastName, email, phoneNumber, password } = user as TrainerDTO;

    let hashedPassword = password ? await this.passwordBcrypt.hash(password) : "";

    const clientId = generateUniqueId("trainer");

    const savedTrainer = await this.userRepository.save({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      clientId,
      role: "trainer",
    });

    if (!savedTrainer) return;

    return savedTrainer;
  }
}
