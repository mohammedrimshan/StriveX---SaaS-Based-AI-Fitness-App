import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { IBaseRepository } from "../base-repository.interface";

export interface IAiWorkoutPlanRepository extends IBaseRepository<IWorkoutPlan>{
  findByClientId(clientId: string): Promise<IWorkoutPlan[]>;
}

export interface IAiDietPlanRepository extends IBaseRepository<IDietPlan>{
  findByClientId(clientId: string): Promise<IDietPlan[]>;
}
