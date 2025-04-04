import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";

export interface IGetDietPlanUseCase {
    execute(clientId: string): Promise<IDietPlan[]>;
}