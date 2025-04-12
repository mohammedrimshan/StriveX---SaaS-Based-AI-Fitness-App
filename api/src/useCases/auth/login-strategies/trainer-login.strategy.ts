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

  private _trainerRepository : ITrainerRepository
  private _passwordBcrypt : IBcrypt

  constructor(
    @inject("ITrainerRepository")  trainerRepository: ITrainerRepository,
    @inject("IPasswordBcrypt")  passwordBcrypt: IBcrypt
  ) {
    this._trainerRepository = trainerRepository
    this._passwordBcrypt = passwordBcrypt
  }

  async login(user: LoginUserDTO): Promise<Partial<ITrainerEntity>> {
    const trainer = await this._trainerRepository.findByEmail(user.email);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (trainer.approvalStatus !== TrainerApprovalStatus.APPROVED) {
      throw new CustomError(
        "Your account is not approved yet. Please wait for admin approval.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (trainer.status !== "active") {
      throw new CustomError(
        "Your account has been deactivated. Please contact support.",
        HTTP_STATUS.FORBIDDEN
      );
    }

    if (user.password) {
      const isPasswordMatch = await this._passwordBcrypt.compare(user.password, trainer.password);
      if (!isPasswordMatch) {
        throw new CustomError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
      }
    }

    return trainer;
  }
}
