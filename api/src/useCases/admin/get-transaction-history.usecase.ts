import { inject, injectable } from "tsyringe";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IGetTransactionHistoryUseCase } from "@/entities/useCaseInterfaces/admin/get-transaction-history.interface";
import { PaymentStatus } from "@/shared/constants";

@injectable()
export class GetTransactionHistoryUseCase
  implements IGetTransactionHistoryUseCase
{
  constructor(
    @inject("IPaymentRepository")
    private readonly paymentRepository: IPaymentRepository,
    @inject("IMembershipPlanRepository")
    private readonly membershipPlanRepository: IMembershipPlanRepository,
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(params: {
    userId?: string;
    role?: "client" | "trainer";
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "completed" | "pending";
  }): Promise<{
    items: {
      id: string;
      clientId: string;
      userName?: string;
      membershipPlanId: string;
      planName?: string;
      amount: number;
      stripeSessionId: string;
      trainerAmount?: number;
      adminAmount: number;
      status: string;
      createdAt: string;
      updatedAt?: string;
      stripePaymentId?: string;
    }[];
    total: number;
  }> {
    const { userId, role, page = 1, limit = 10, search, status } = params;

    const filter: any = {};

    if (userId && role) {
      filter[role === "client" ? "clientId" : "trainerId"] = userId;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const { items: transactions, total: totalTransactions } =
      await this.paymentRepository.find(filter, skip, limit);

    const clientIds = [...new Set(transactions.map((t) => t.clientId))];

    // Fetch clients using findByClientNewId
    const clients = await Promise.all(
      clientIds.map(async (clientId) => {
        try {
          const client = await this.clientRepository.findByClientNewId(clientId);
          return {
            id: clientId, // Use the original clientId from the payment
            name: client
              ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || "Unknown User"
              : "Unknown User",
          };
        } catch (error) {
          console.warn(`Error fetching client for clientId: ${clientId}`, error);
          return { id: clientId, name: "Unknown User" };
        }
      })
    );

    let filteredClients = clients;

    if (search) {
      filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const filteredClientIds = filteredClients.map((client) => client.id);
    const clientMap = new Map(
      filteredClients.map((client) => [client.id, client.name])
    );

    let finalTransactions = transactions;
    let total = totalTransactions;
    if (search) {
      finalTransactions = transactions.filter((transaction) =>
        filteredClientIds.includes(transaction.clientId)
      );
      total = finalTransactions.length;
    }

    const membershipPlanIds = [
      ...new Set(finalTransactions.map((t) => t.membershipPlanId)),
    ];
    const plans = await this.membershipPlanRepository.findByIds(
      membershipPlanIds
    );
    const planMap = new Map(
      plans.map((plan) => [plan.id, plan.name || "Unknown Plan"])
    );

    const enrichedTransactions = finalTransactions.map((transaction) => ({
      id: transaction.id,
      clientId: transaction.clientId,
      userName: clientMap.get(transaction.clientId) || "Unknown User",
      membershipPlanId: transaction.membershipPlanId,
      planName: planMap.get(transaction.membershipPlanId) || "Unknown Plan",
      amount: transaction.amount,
      stripeSessionId: transaction.stripeSessionId,
      trainerAmount: transaction.trainerAmount ?? 0,
      adminAmount: transaction.adminAmount,
      status: transaction.status as string,
      createdAt:
        transaction.createdAt instanceof Date
          ? transaction.createdAt.toISOString()
          : transaction.createdAt,
      updatedAt:
        transaction.updatedAt instanceof Date
          ? transaction.updatedAt.toISOString()
          : transaction.updatedAt,
      stripePaymentId: transaction.stripePaymentId,
    }));

    return { items: enrichedTransactions, total };
  }
}