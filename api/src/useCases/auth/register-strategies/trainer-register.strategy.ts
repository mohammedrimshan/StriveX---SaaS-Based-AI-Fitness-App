import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategy.interface";
import { TrainerDTO, UserDTO } from "@/shared/dto/user.dto";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { IBcrypt } from "@/frameworks/security/bcrypt.interface";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
import { IUserEntity } from "@/entities/models/user.entity";
import { trainerSchema } from "@/interfaceAdapters/controllers/auth/validations/user-signup.validation.schema";
import { TrainerApprovalStatus } from "@/shared/constants";

@injectable()
export class TrainerRegisterStrategy implements IRegisterStrategy {
  constructor(
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async register(user: UserDTO): Promise<IUserEntity | null> {
    if (user.role !== "trainer") {
      throw new CustomError("Invalid role for user registration", HTTP_STATUS.BAD_REQUEST);
    }

    const existingTrainer = await this.trainerRepository.findByEmail(user.email);
    if (existingTrainer) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const validationResult = trainerSchema.safeParse(user);
    if (!validationResult.success) {
      throw new CustomError("Invalid input data", HTTP_STATUS.BAD_REQUEST);
    }

    const { firstName, lastName, email, phoneNumber, password, dateOfBirth, gender, experience, skills } = user as TrainerDTO;

    let hashedPassword = password ? await this.passwordBcrypt.hash(password) : "";
    const clientId = generateUniqueId("trainer");

    const savedTrainer = await this.trainerRepository.save({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      dateOfBirth,
      gender,
      experience,
      skills,
      clientId,
      role: "trainer",
      approvalStatus: TrainerApprovalStatus.PENDING, // Set default approval status
    });

    if (!savedTrainer) {
      return null; // Explicitly return null if save fails
    }

    return savedTrainer; // Return the saved trainer entity
  }
}