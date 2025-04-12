import { inject, injectable } from "tsyringe";
import { IChangeUserPasswordUseCase } from "@/entities/useCaseInterfaces/users/change-user-password-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IAdminRepository } from "@/entities/repositoryInterfaces/admin/admin-repository.interface";
import { IBcrypt } from "@/frameworks/security/bcrypt.interface";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";

@injectable()
export class ChangeUserPasswordUseCase implements IChangeUserPasswordUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository,
    @inject("ITrainerRepository")
    private _trainerRepository: ITrainerRepository,
    @inject("IAdminRepository")
	private _adminRepository: IAdminRepository,
    @inject("IPasswordBcrypt")
	private _passwordBcrypt: IBcrypt
  ) {}

  async execute({
    oldPassword,
    newPassword,
    email,
    role,
  }: {
    oldPassword: string;
    newPassword: string;
    email: string;
    role: string;
  }): Promise<void> {
    let repository;

    if (role === "client") {
      repository = this._clientRepository;
    } else if (role === "trainer") {
      repository = this._trainerRepository;
    } else if (role === "admin") {
      repository = this._adminRepository;
    } else {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const user = await repository.findByEmail(email);
    if (!user) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const isCorrectOldPassword = await this._passwordBcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isCorrectOldPassword) {
      throw new CustomError(
        ERROR_MESSAGES.WRONG_CURRENT_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (oldPassword === newPassword) {
      throw new CustomError(
        ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const hashedNewPassword = await this._passwordBcrypt.hash(newPassword);
    await repository.updateByEmail(email, { password: hashedNewPassword });
  }
}
