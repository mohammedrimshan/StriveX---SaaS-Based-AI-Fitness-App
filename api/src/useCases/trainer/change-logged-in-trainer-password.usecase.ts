import { inject, injectable } from "tsyringe";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IUpdateTrainerPasswordUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-password.usecase.interface";
import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";

@injectable()
export class UpdateTrainerPasswordUseCase
  implements IUpdateTrainerPasswordUseCase
{
  constructor(
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("IPasswordBcrypt") private _passwordBcrypt: IBcrypt
  ) {}
  async execute(id: any, current: string, newPassword: string): Promise<void> {
    const user = await this._trainerRepository.findById(id);

    if (!user) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const isPasswordMatch = await this._passwordBcrypt.compare(
      current,
      user.password
    );

    if (!isPasswordMatch) {
      throw new CustomError(
        ERROR_MESSAGES.WRONG_CURRENT_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const isCurrentAndNewPasswordAreSame = await this._passwordBcrypt.compare(
      newPassword,
      user.password
    );

    if (isCurrentAndNewPasswordAreSame) {
      throw new CustomError(
        ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const hashedPassword = await this._passwordBcrypt.hash(newPassword);

    await this._trainerRepository.findByIdAndUpdatePassword(id, hashedPassword);
  }
}
