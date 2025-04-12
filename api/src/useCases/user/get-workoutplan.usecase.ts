import { inject, injectable } from "tsyringe";
import { IAiWorkoutPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IGetWorkoutPlanUseCase } from "@/entities/useCaseInterfaces/users/get-workout-plans.usecase.interface";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
@injectable()
export class GetWorkoutPlanUseCase implements IGetWorkoutPlanUseCase {
    constructor(
        @inject("IAiWorkoutPlanRepository") private _workoutPlanRepository: IAiWorkoutPlanRepository
    ) {}

    async execute(clientId: string): Promise<IWorkoutPlan[]> {
        return this._workoutPlanRepository.findByClientId(clientId);
    }
}
