import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";

export interface IGenerateDietPlanUseCase {
    execute(clientId: string): Promise<IDietPlan>;
}
