
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
    private clientRegister: IRegisterStrategy
  ) {
    this.strategies = {
      client: this.clientRegister,
    };
  }

  async execute(client: UserDTO): Promise<void> {
    console.log("Received Role:", client.role);
    console.log("Available Strategies:", Object.keys(this.strategies));
    const strategy = this.strategies[client.role];
    if (!strategy) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.FORBIDDEN
      );
    }
    await strategy.register(client);
  }
}