import { inject, injectable } from "tsyringe";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import client from "../../frameworks/cache/redis.client";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IUpdateUserStatusUseCase } from "@/entities/useCaseInterfaces/admin/update-user-status-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";

@injectable()
export class UpdateUserStatusUseCase implements IUpdateUserStatusUseCase {
	constructor(
		@inject("IClientRepository")
		private clientRepository: IClientRepository,
		@inject("ITrainerRepository")
		private trainerRepository: ITrainerRepository
	) {}
	async execute(userType: string, userId: any): Promise<void> {
		if (userType === "client") {
			const user = await this.clientRepository.findById(userId);

			if (!user) {
				throw new CustomError(
					ERROR_MESSAGES.USER_NOT_FOUND,
					HTTP_STATUS.NOT_FOUND
				);
			}

			const newStatus = user.status === "active" ? "blocked" : "active";

			await this.clientRepository.findByIdAndUpdate(userId, {
				status: newStatus,
			});
		} else if (userType === "trainer") {
			const user = await this.trainerRepository.findById(userId);

			if (!user) {
				throw new CustomError(
					ERROR_MESSAGES.USER_NOT_FOUND,
					HTTP_STATUS.NOT_FOUND
				);
			}

			const newStatus = user.status === "active" ? "blocked" : "active";

			await this.trainerRepository.findByIdAndUpdate(userId, {
				status: newStatus,
			});
		}
	}
}
