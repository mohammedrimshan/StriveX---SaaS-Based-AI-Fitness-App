import { injectable, inject } from "tsyringe";
import { IGetUserSubscriptionsUseCase } from "@/entities/useCaseInterfaces/admin/get-usersubscriptions-useCase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";

@injectable()
export class GetUserSubscriptionsUseCase implements IGetUserSubscriptionsUseCase {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(params: {
    page: number;
    limit: number;
    search?: string;
    status?: "all" | "active" | "expired";
  }): Promise<{
    items: {
      clientId: string;
      clientName: string;
      profileImage?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
      isExpired: boolean;
      daysUntilExpiration: number;
      membershipPlanId?: string;
      planName?: string;
      amount?: number;
      status: string;
    }[];
    total: number;
  }> {
    try {
      return await this.clientRepository.findUserSubscriptions(
        params.page,
        params.limit,
        params.search,
        params.status
      );
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      throw error;
    }
  }
}