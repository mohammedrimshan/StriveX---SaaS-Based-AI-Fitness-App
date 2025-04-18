import Stripe from "stripe";

export interface IStripeService {
  createConnectAccount(trainerId: string, email: string): Promise<string>;
  createCheckoutSession(
    userId: string,
    plan: { id: string; price: number; name: string },
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string; sessionId: string }>; // Updated return type
  createTransfer(
    amount: number,
    stripeConnectId: string,
    paymentIntentId: string
  ): Promise<Stripe.Transfer>;
  getWebhookEvent(body: any, signature: string): Promise<Stripe.Event>;
  createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string>;
  getCheckoutSessionByUrl(sessionId: string): Promise<Stripe.Checkout.Session>;
}