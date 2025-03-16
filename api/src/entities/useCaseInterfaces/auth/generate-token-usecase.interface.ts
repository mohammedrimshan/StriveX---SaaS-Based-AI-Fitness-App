export interface IGenerateTokenUseCase {
	execute(
		id: string,
		email: string,
		role: string
	): Promise<{ accessToken: string; refreshToken: string }>;
}
