import { injectable } from "tsyringe";
import { IMembershipPlanEntity } from "@/entities/models/membership-plan.entity";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { MembershipPlanModel } from "@/frameworks/database/mongoDB/models/membership-plan.model";
import { BaseRepository } from "../base.repository";

@injectable()
export class MembershipPlanRepository 
  extends BaseRepository<IMembershipPlanEntity> 
  implements IMembershipPlanRepository {
  
  constructor() {
    super(MembershipPlanModel);
  }

  async findActivePlans(): Promise<IMembershipPlanEntity[]> {
    const plans = await this.model.find({ isActive: true }).lean();
    return plans.map(plan => this.mapToEntity(plan));
  }
}