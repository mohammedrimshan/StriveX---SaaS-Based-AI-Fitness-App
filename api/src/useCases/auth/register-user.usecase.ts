
import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategies/register-strategy.interface";
import { IRegisterUserUseCase } from "@/entities/useCaseInterfaces/auth/register-usecase.interface";
import { UserDTO } from "@/shared/dto/user.dto";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  private strategies: Record<string, IRegisterStrategy>;

  constructor(
    @inject("ClientRegisterStrategy")
    private userRegister: IRegisterStrategy
  ) {
    this.strategies = {
      user: this.userRegister,
    };
  }

  async execute(user: UserDTO): Promise<void> {
    const strategy = this.strategies[user.role];
    if (!strategy) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.FORBIDDEN
      );
    }
    await strategy.register(user);
  }
}