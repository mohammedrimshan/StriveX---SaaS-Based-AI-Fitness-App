
export interface IUpgradeSubscriptionUseCase {
  execute(data: {
    clientId: string;
    newPlanId: string;
    successUrl: string;
    cancelUrl: string;
    useWalletBalance?: boolean;
  }): Promise<string>;
}