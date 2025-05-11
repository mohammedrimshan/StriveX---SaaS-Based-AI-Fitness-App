import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IGenerateDietPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-diet-plans.usecase.interface";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { GeminiService } from "@/interfaceAdapters/services/gemini.service";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GenerateDietPlanUseCase implements IGenerateDietPlanUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("IAiDietPlanRepository") private _dietPlanRepository: IAiDietPlanRepository,
    @inject("GeminiService") private _geminiService: GeminiService
  ) {}

  async execute(clientId: string): Promise<IDietPlan> {
    const client = await this._clientRepository.findByClientId(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!client.fitnessGoal || !client.activityLevel) {
      throw new CustomError(
        ERROR_MESSAGES.INCOMPLETE_CLIENT_PROFILE,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const dietPlan = await this._geminiService.generateDietPlan(client);
    return this._dietPlanRepository.save(dietPlan);
  }
}
