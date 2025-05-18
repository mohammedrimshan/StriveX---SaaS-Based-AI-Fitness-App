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
 async findByIds(ids: string[]): Promise<{ id: string; name: string }[]> {
  try {
    const plans = await this.model
      .find({ _id: { $in: ids } })
      .select("name")
      .lean<{ _id: any; name: string }[]>(); 

    return plans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
    }));
  } catch (error) {
    console.error(`Error finding plans by IDs:`, error);
    throw error;
  }
}
}