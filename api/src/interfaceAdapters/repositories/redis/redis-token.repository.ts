import { injectable } from "tsyringe";
import { IRedisTokenRepository } from "./../../../entities/repositoryInterfaces/redis/redis-token-repository.interface";
import client from "../../../frameworks/cache/redis.client";

@injectable()
export class RedisTokenRepository implements IRedisTokenRepository {
	async blackListToken(token: string, expiresIn: number): Promise<void> {
		await client.set(token, "blacklisted", { EX: expiresIn });
	}

	async isTokenBlackListed(token: string): Promise<boolean> {
		const result = await client.get(token);
		return result === "blacklisted";
	}

	async storeResetToken(userId: string, token: string): Promise<void> {
		const key = `reset_token:${userId}`;
		await client.setEx(key, 300, token);
	}

	async verifyResetToken(userId: string, token: string): Promise<boolean> {
		const key = `reset_token:${userId}`;
		const storedToken = await client.get(key);
		return storedToken === token;
	}

	async deleteResetToken(userId: string) {
		const key = `reset_token:${userId}`;
		await client.del(key);
	}
}
