import { Document, ObjectId, model } from "mongoose";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { DietPlanSchema } from "../schemas/ai-dietplan.schema";
export interface IDietPlanModel extends Omit<IDietPlan, "id">, Document {
    _id: ObjectId;
  }


export const DietPlanModel = model<IDietPlanModel>("DietPlan", DietPlanSchema);