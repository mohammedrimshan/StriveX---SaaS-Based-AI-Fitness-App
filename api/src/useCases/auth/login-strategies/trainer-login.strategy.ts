import { inject, injectable } from "tsyringe";
import { LoginUserDTO } from "../../../shared/dto/user.dto";
import { ILoginStrategy } from "./login-strategy.interface";
import { IBcrypt } from "./../../../frameworks/security/bcrypt.interface";
import { ITrainerRepository } from "../../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "../../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, TrainerApprovalStatus } from "../../../shared/constants";
import { ITrainerEntity } from "@/entities/models/trainer.entity";

@injectable()
export class TrainerLoginStrategy implements ILoginStrategy {
  constructor(
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
  ) {}

  async login(user: LoginUserDTO): Promise<Partial<ITrainerEntity>> {
    const trainer = await this.trainerRepository.findByEmail(user.email);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // ❌ Prevent login if trainer is not approved
    if (trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(
        "Your account is not approved yet. Please wait for admin approval.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // ❌ Prevent login if trainer is inactive
    if (trainer.status !== "active") {
      throw new CustomError(
        "Your account has been deactivated. Please contact support.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    // ✅ Check if password matches
    if (user.password) {
      const isPasswordMatch = await this.passwordBcrypt.compare(user.password, trainer.password);
      if (!isPasswordMatch) {
        throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
      }
    }

    return trainer;
  }
}
