
import { injectable } from "tsyringe";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import {
  IAiWorkoutPlanRepository,
  IAiDietPlanRepository,
} from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { WorkoutPlanModel } from "@/frameworks/database/mongoDB/models/ai-workout.model";
import { DietPlanModel } from "@/frameworks/database/mongoDB/models/ai-dietplan.model";
import { BaseRepository } from "../base.repository";
import mongoose from "mongoose";

@injectable()
export class AiWorkoutPlanRepository
  extends BaseRepository<IWorkoutPlan>
  implements IAiWorkoutPlanRepository
{
  constructor() {
    super(WorkoutPlanModel);
  }

  async findByClientId(clientId: string): Promise<IWorkoutPlan[]> {
    const plans = await this.model
      .find({ clientId })
      .sort({ createdAt: -1 })
      .lean();
    return plans.map((plan) => this.mapToEntity(plan));
  }

  async update(
    id: string,
    plan: Partial<IWorkoutPlan>
  ): Promise<IWorkoutPlan | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updatedPlan = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { ...plan, updatedAt: new Date() } },
        { new: true }
      )
      .lean();
    if (!updatedPlan) return null;
    return this.mapToEntity(updatedPlan);
  }
}

@injectable()
export class AiDietPlanRepository
  extends BaseRepository<IDietPlan>
  implements IAiDietPlanRepository
{
  constructor() {
    super(DietPlanModel);
  }

  async findByClientId(clientId: string): Promise<IDietPlan[]> {
    const plans = await this.model
      .find({ clientId })
      .sort({ createdAt: -1 })
      .lean();
    return plans.map((plan) => this.mapToEntity(plan));
  }

  async update(
    id: string,
    plan: Partial<IDietPlan>
  ): Promise<IDietPlan | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updatedPlan = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { ...plan, updatedAt: new Date() } },
        { new: true }
      )
      .lean();
    if (!updatedPlan) return null;
    return this.mapToEntity(updatedPlan);
  }
}
