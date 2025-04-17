import { IMembershipPlanEntity } from "@/entities/models/membership-plan.entity";
import { IBaseRepository } from "../base-repository.interface";

export interface IMembershipPlanRepository extends IBaseRepository<IMembershipPlanEntity> {
  findActivePlans(): Promise<IMembershipPlanEntity[]>;
}