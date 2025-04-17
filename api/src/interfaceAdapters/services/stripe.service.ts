import { injectable } from "tsyringe";
import Stripe from "stripe";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-03-31.basil",
    });
    console.log("Webhook secret loaded:", process.env.STRIPE_WEBHOOK_SECRET);
  }

  async createConnectAccount(trainerId: string, email: string): Promise<string> {
    const account = await this.stripe.accounts.create({
      type: "express",
      email,
      metadata: { trainerId },
    });
    return account.id;
  }

  async createCheckoutSession(
    userId: string,
    plan: { id: string; price: number; name: string },
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              metadata: { planId: plan.id, userId },
            },
            unit_amount: plan.price * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    });
    return session.url!;
  }

  async createTransfer(
    amount: number,
    stripeConnectId: string,
    paymentIntentId: string
  ): Promise<Stripe.Transfer> {
    const transfer = await this.stripe.transfers.create({
      amount: amount * 100, 
      currency: "usd",
      destination: stripeConnectId,
      source_transaction: paymentIntentId,
    });
    return transfer;
  }

  async getWebhookEvent(body: any, signature: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      throw new CustomError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST);
    }
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string> {
    const accountLink = await this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    return accountLink.url;
  }
}