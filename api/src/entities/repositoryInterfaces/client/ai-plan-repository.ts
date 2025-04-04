import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
export interface IAiWorkoutPlanRepository {
  save(plan: IWorkoutPlan): Promise<IWorkoutPlan>;
  findById(id: string): Promise<IWorkoutPlan | null>;
  findByClientId(clientId: string): Promise<IWorkoutPlan[]>;
  update(id: string, plan: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAiDietPlanRepository {
  save(plan: IDietPlan): Promise<IDietPlan>;
  findById(id: string): Promise<IDietPlan | null>;
  findByClientId(clientId: string): Promise<IDietPlan[]>;
  update(id: string, plan: Partial<IDietPlan>): Promise<IDietPlan | null>;
  delete(id: string): Promise<boolean>;
}
