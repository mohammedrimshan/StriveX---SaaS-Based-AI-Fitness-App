import { inject, injectable } from "tsyringe";
import { IBlackListTokenUseCase } from "./../../entities/useCaseInterfaces/auth/blacklist-token-usecase.interface";
import { IRedisTokenRepository } from "../../entities/repositoryInterfaces/redis/redis-token-repository.interface";
import { ITokenService } from "../../entities/services/token-service.interface";
import { JwtPayload } from "jsonwebtoken";

@injectable()
export class BlackListTokenUseCase implements IBlackListTokenUseCase {
	constructor(
		@inject("IRedisTokenRepository")
		private _redisTokenRepository: IRedisTokenRepository,
		@inject("ITokenService") 
		private _tokenService: ITokenService
	) {}
	async execute(token: string): Promise<void> {
		const decoded: string | JwtPayload | null =
			this._tokenService.verifyAccessToken(token);
		if (!decoded || typeof decoded === "string" || !decoded.exp) {
			throw new Error("Invalid Token: Missing expiration time");
		}

		const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
		if (expiresIn > 0) {
			await this._redisTokenRepository.blackListToken(token, expiresIn);
		}
	}
}
