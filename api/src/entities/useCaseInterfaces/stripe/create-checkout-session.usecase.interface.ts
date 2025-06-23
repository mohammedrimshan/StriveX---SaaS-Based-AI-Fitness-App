export interface ICreateCheckoutSessionUseCase {
  execute(data: {
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
    useWalletBalance?: boolean;
  }): Promise<string>;
}