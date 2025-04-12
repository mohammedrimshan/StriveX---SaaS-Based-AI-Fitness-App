import { inject, injectable } from "tsyringe";
import { IRegisterStrategy } from "./register-strategies/register-strategy.interface";
import { IRegisterUserUseCase } from "@/entities/useCaseInterfaces/auth/register-usecase.interface";
import { UserDTO } from "@/shared/dto/user.dto";
import { IUserEntity } from "@/entities/models/user.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  private strategies: Record<string, IRegisterStrategy>;

  constructor(
    @inject("ClientRegisterStrategy")
    private _clientRegister: IRegisterStrategy,
    @inject("AdminRegisterStrategy")
    private _adminRegister: IRegisterStrategy,
    @inject("TrainerRegisterStrategy")
    private _trainerRegister: IRegisterStrategy
  ) {
    this.strategies = {
      client: this._clientRegister,
      admin: this._adminRegister,
      trainer: this._trainerRegister,
    };
  }

  async execute(user: UserDTO): Promise<IUserEntity | null> {
    console.log("Received Role:", user.role);
    console.log("Available Strategies:", Object.keys(this.strategies));

    const strategy = this.strategies[user.role];
    if (!strategy) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ROLE,
        HTTP_STATUS.FORBIDDEN
      );
    }

    const registeredUser = await strategy.register(user);
    return registeredUser; 
  }
}