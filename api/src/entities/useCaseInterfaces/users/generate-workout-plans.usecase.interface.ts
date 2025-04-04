import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
export interface IGenerateWorkoutPlanUseCase {
    execute(clientId: string): Promise<IWorkoutPlan>;
}