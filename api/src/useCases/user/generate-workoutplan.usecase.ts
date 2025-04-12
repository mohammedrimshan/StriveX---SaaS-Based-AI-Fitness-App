import { inject, injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IAiWorkoutPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IGenerateWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/generate-workout-plans.usecase.interface";
import { GeminiService } from "@/interfaceAdapters/services/gemini.service";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";


@injectable()
export class GenerateWorkoutPlanUseCase implements IGenerateWorkoutPlanUseCase {
    constructor(
        @inject("IClientRepository") private _clientRepository: IClientRepository,
        @inject("IAiWorkoutPlanRepository") private _workoutPlanRepository: IAiWorkoutPlanRepository,
        @inject("GeminiService") private _geminiService: GeminiService
    ) {}

    async execute(clientId: string): Promise<IWorkoutPlan> {
        const client = await this._clientRepository.findByClientId(clientId);
        if (!client) {
            throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
        }

        if (!client.fitnessGoal || !client.experienceLevel || !client.activityLevel) {
            throw new CustomError(
                "Client profile is incomplete. Please update fitness goal, experience level, and activity level.",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const workoutPlan = await this._geminiService.generateWorkoutPlan(client);
        return this._workoutPlanRepository.save(workoutPlan);
    }
}