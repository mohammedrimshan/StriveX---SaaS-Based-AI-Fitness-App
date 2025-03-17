import { inject, injectable } from "tsyringe";
import { ILoginUserUseCase } from "../../entities/useCaseInterfaces/auth/login-usecase.interface";
import { LoginUserDTO } from "../../shared/dto/user.dto";
import { ILoginStrategy } from "./login-strategies/login-strategy.interface";
import { CustomError } from "../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import { IUserEntity } from './../../entities/models/user.entity';

@injectable()
export class LoginUserUseCase implements ILoginUserUseCase {
	private strategies: Record<string, ILoginStrategy>;
	constructor(
		@inject("ClientLoginStrategy") private clientLogin: ILoginStrategy,
		// @inject("TrainerLoginStrategy") private trainerLogin: ILoginStrategy,
		 @inject("AdminLoginStrategy") private adminLogin: ILoginStrategy
	) {
		this.strategies = {
			client: clientLogin,
			// trainer: trainerLogin,
			 admin: adminLogin
		};
	}

	async execute(user: LoginUserDTO): Promise<Partial<IUserEntity>> {
		const strategy = this.strategies[user.role];
		if (!strategy) {
			throw new CustomError(
				ERROR_MESSAGES.INVALID_ROLE,
				HTTP_STATUS.FORBIDDEN
			);
		}
		return await strategy.login(user);
	}
}
