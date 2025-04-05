import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IGenerateDietPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-diet-plans.usecase.interface";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { GeminiService } from "@/interfaceAdapters/services/gemini.service";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GenerateDietPlanUseCase implements IGenerateDietPlanUseCase {
    constructor(
        @inject("IClientRepository") private clientRepository: IClientRepository,
        @inject("IAiDietPlanRepository") private dietPlanRepository: IAiDietPlanRepository,
        @inject("GeminiService") private geminiService: GeminiService
    ) {}

    async execute(clientId: string): Promise<IDietPlan> {
        const client = await this.clientRepository.findByClientId(clientId);
        if (!client) {
            throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
        }

        if (!client.fitnessGoal || !client.activityLevel) {
            throw new CustomError(
                "Client profile is incomplete. Please update fitness goal and activity level.",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const dietPlan = await this.geminiService.generateDietPlan(client);
        return this.dietPlanRepository.save(dietPlan);
    }
}