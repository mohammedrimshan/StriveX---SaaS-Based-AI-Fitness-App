export interface ICreateStripeConnectAccountUseCase {
    execute(
      trainerId: string,
      email: string,
      data: {
        refreshUrl: string;
        returnUrl: string;
      }
    ): Promise<{ stripeConnectId: string; accountLinkUrl: string }>;
  }