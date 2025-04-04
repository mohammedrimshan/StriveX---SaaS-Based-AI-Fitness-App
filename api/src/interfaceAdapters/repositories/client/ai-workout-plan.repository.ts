import { injectable } from "tsyringe";
import { IDietPlan } from "@/entities/models/ai-diet-plan.entity";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IAiWorkoutPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { IAiDietPlanRepository } from "@/entities/repositoryInterfaces/client/ai-plan-repository";
import { WorkoutPlanModel } from "@/frameworks/database/mongoDB/models/ai-workout.model";
import { DietPlanModel } from "@/frameworks/database/mongoDB/models/ai-dietplan.model";
import mongoose from "mongoose"; 

@injectable()
export class AiWorkoutPlanRepository implements IAiWorkoutPlanRepository {
    async save(plan: IWorkoutPlan): Promise<IWorkoutPlan> {
        const savedPlan = await WorkoutPlanModel.create(plan);
        return {
            ...savedPlan.toObject(),
            id: savedPlan._id.toString()
        } as IWorkoutPlan;
    }

    async findById(id: string): Promise<IWorkoutPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const plan = await WorkoutPlanModel.findById(id).lean();
        if (!plan) return null;
        return {
            ...plan,
            id: plan._id.toString()
        } as IWorkoutPlan;
    }

    async findByClientId(clientId: string): Promise<IWorkoutPlan[]> {
        const plans = await WorkoutPlanModel.find({ clientId }).sort({ createdAt: -1 }).lean();
        return plans.map(plan => ({
            ...plan,
            id: plan._id.toString()
        } as IWorkoutPlan));
    }

    async update(id: string, plan: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const updatedPlan = await WorkoutPlanModel.findByIdAndUpdate(
            id,
            { $set: { ...plan, updatedAt: new Date() } },
            { new: true }
        ).lean();
        if (!updatedPlan) return null;
        return {
            ...updatedPlan,
            id: updatedPlan._id.toString()
        } as IWorkoutPlan;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
        const result = await WorkoutPlanModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }
}

@injectable()
export class AiDietPlanRepository implements IAiDietPlanRepository {
    async save(plan: IDietPlan): Promise<IDietPlan> {
        const savedPlan = await DietPlanModel.create(plan);
        return {
            ...savedPlan.toObject(),
            id: savedPlan._id.toString()
        } as IDietPlan;
    }

    async findById(id: string): Promise<IDietPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const plan = await DietPlanModel.findById(id).lean();
        if (!plan) return null;
        return {
            ...plan,
            id: plan._id.toString()
        } as IDietPlan;
    }

    async findByClientId(clientId: string): Promise<IDietPlan[]> {
        const plans = await DietPlanModel.find({ clientId }).sort({ createdAt: -1 }).lean();
        console.log(plans,"pl")
        return plans.map(plan => ({
            ...plan,
            id: plan._id.toString()
        } as IDietPlan));
    }

    async update(id: string, plan: Partial<IDietPlan>): Promise<IDietPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const updatedPlan = await DietPlanModel.findByIdAndUpdate(
            id,
            { $set: { ...plan, updatedAt: new Date() } },
            { new: true }
        ).lean();
        if (!updatedPlan) return null;
        return {
            ...updatedPlan,
            id: updatedPlan._id.toString()
        } as IDietPlan;
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
        const result = await DietPlanModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }
}