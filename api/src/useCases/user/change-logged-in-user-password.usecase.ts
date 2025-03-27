import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IUpdateClientPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-logged-in-user-password-usecase.interface";
import { IBcrypt } from "../../frameworks/security/bcrypt.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";

@injectable()
export class UpdateClientPasswordUseCase
  implements IUpdateClientPasswordUseCase
{
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
  ) {}
  async execute(id: any, current: string, newPassword: string): Promise<void> {
    const user = await this.clientRepository.findById(id);

    if (!user) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const isPasswordMatch = await this.passwordBcrypt.compare(
      current,
      user.password
    );

    if (!isPasswordMatch) {
      throw new CustomError(
        ERROR_MESSAGES.WRONG_CURRENT_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const isCurrentAndNewPasswordAreSame = await this.passwordBcrypt.compare(
      newPassword,
      user.password
    );

    if (isCurrentAndNewPasswordAreSame) {
      throw new CustomError(
        ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const hashedPassword = await this.passwordBcrypt.hash(newPassword);

    await this.clientRepository.findByIdAndUpdatePassword(id, hashedPassword);
  }
}
