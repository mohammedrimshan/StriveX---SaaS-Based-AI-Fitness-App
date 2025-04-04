import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";

export interface IGetWorkoutPlanUseCase {
    execute(clientId: string): Promise<IWorkoutPlan[]>;
}
