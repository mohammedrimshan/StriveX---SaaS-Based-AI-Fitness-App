import { inject, injectable } from "tsyringe";
import { LoginUserDTO } from "../../../shared/dto/user.dto";
import { ILoginStrategy } from "./login-strategy.interface";
import { IBcrypt } from "./../../../frameworks/security/bcrypt.interface";
import { IClientRepository } from "../../../entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "../../../entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../../shared/constants";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class ClientLoginStrategy implements ILoginStrategy {
	constructor(
		@inject("IClientRepository")
		private clientRepository: IClientRepository,
		@inject("IPasswordBcrypt") private passwordBcrypt: IBcrypt
	) {}
	async login(user: LoginUserDTO): Promise<Partial<IClientEntity>> {
		const client = await this.clientRepository.findByEmail(user.email);
		console.log(client,"Cl")
		if (!client) {
			throw new CustomError(
				ERROR_MESSAGES.USER_NOT_FOUND,
				HTTP_STATUS.NOT_FOUND
			);
		}
		if (client.status !== "active") {
			throw new CustomError(
				ERROR_MESSAGES.BLOCKED,
				HTTP_STATUS.FORBIDDEN
			);
		}
		if (user.password) {
			const isPasswordMatch = await this.passwordBcrypt.compare(
				user.password,
				client.password
			);
			if (!isPasswordMatch) {
				throw new CustomError(
					ERROR_MESSAGES.INVALID_CREDENTIALS,
					HTTP_STATUS.BAD_REQUEST
				);
			}
		}
      return client
	}
}
