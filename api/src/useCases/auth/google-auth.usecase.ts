import { inject, injectable } from "tsyringe";
import { IGoogleUseCase } from "@/entities/useCaseInterfaces/auth/google-auth.usecase.interface";
import { OAuth2Client } from "google-auth-library";
import { IUserEntity } from "@/entities/models/user.entity";
import { ERROR_MESSAGES, HTTP_STATUS, TRole } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { UserDTO } from "@/shared/dto/user.dto";
import { IRegisterUserUseCase } from "@/entities/useCaseInterfaces/auth/register-usecase.interface";

@injectable()
export class GoogleUseCase implements IGoogleUseCase {
	private oAuthClient: OAuth2Client;
	constructor(
		@inject("IRegisterUserUseCase")
		private registerUserUseCase: IRegisterUserUseCase,
		@inject("IClientRepository")
		private clientRepository: IClientRepository,
		@inject("ITrainerRepository")
		private trainerRepository: ITrainerRepository
	) {
		this.oAuthClient = new OAuth2Client();
	}

	async execute(
		credential: string,
		client_id: string,
		role: TRole
	): Promise<Partial<IUserEntity>> {
		const ticket = await this.oAuthClient.verifyIdToken({
			idToken: credential,
			audience: client_id,
		});

		const payload = ticket.getPayload();
		if (!payload) {
			throw new CustomError(
				"Invalid or empty token payload",
				HTTP_STATUS.UNAUTHORIZED
			);
		}

		const googleId = payload.sub;
		const email = payload.email;
		const firstName = payload.given_name || "";
		const lastName = payload.family_name || "";
		const profileImage = payload.picture || "";

		if (!email) {
			throw new CustomError("Email is required", HTTP_STATUS.BAD_REQUEST);
		}

		let repository;
		if (role === "client") {
			repository = this.clientRepository;
		} else if (role === "trainer") {
			repository = this.trainerRepository;
		} else {
			throw new CustomError(
				ERROR_MESSAGES.INVALID_ROLE,
				HTTP_STATUS.BAD_REQUEST
			);
		}

		const existingUser = await repository.findByEmail(email);

		if (existingUser && existingUser.status !== "active") {
			throw new CustomError(
				ERROR_MESSAGES.BLOCKED,
				HTTP_STATUS.FORBIDDEN
			);
		}

		if (existingUser) return existingUser;

		const newUser = await this.registerUserUseCase.execute({
			firstName,
			lastName,
			role,
			googleId,
			email,
			profileImage,
		} as UserDTO);

		if (!newUser) {
			throw new CustomError(
				"Registration failed",
				HTTP_STATUS.INTERNAL_SERVER_ERROR
			);
		}

		return newUser;
	}
}
