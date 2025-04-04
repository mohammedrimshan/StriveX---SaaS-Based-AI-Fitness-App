import { Document, ObjectId, model } from "mongoose";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { WorkoutPlanSchema } from "../schemas/ai-workout.schema";

// Interface for Workout Plan with MongoDB specific properties
export interface IWorkoutPlanModel extends Omit<IWorkoutPlan, "id">, Document {
  _id: ObjectId;
}

export const WorkoutPlanModel = model<IWorkoutPlanModel>("WorkoutPlan", WorkoutPlanSchema);