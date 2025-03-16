import { inject, injectable } from "tsyringe";
import { IRevokeRefreshTokenUseCase } from "../../entities/useCaseInterfaces/auth/revoke-refresh-token-usecase.interface";
import { IRefreshTokenRepository } from "../../entities/repositoryInterfaces/auth/refresh-token-repository.interface";

@injectable()
export class RevokeRefreshTokenUseCase implements IRevokeRefreshTokenUseCase {
	constructor(
		@inject("IRefreshTokenRepository")
		private refreshTokenRepository: IRefreshTokenRepository
	) {}
	async execute(token: string): Promise<void> {
		await this.refreshTokenRepository.revokeRefreshToken(token);
	}
}
