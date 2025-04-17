import { model } from "mongoose";
import { IMembershipPlanEntity } from "@/entities/models/membership-plan.entity";
import { membershipPlanSchema } from "../schemas/membership-plan.schema";

export const MembershipPlanModel = model<IMembershipPlanEntity>("MembershipPlan", membershipPlanSchema);