import { inject, injectable } from "tsyringe";
import { IGetDietPlanUseCase } from "@/entities/useCaseInterfaces/users/get-diet-plans.usecase.interface";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";

@injectable()
export class GetDietPlanUseCase implements IGetDietPlanUseCase {
    constructor(
        @inject("IAiDietPlanRepository") private _dietPlanRepository: IAiDietPlanRepository
    ) {}

    async execute(clientId: string): Promise<IDietPlan[]> {
        return this._dietPlanRepository.findByClientId(clientId);
    }
}