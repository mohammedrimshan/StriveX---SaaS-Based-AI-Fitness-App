import { injectable, inject } from "tsyringe";
import { IHandleWebhookUseCase } from "@/entities/useCaseInterfaces/stripe/handle-webhook.usecase.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, PaymentStatus } from "@/shared/constants";
import Stripe from "stripe";
import mongoose, { Types } from "mongoose";

@injectable()
export class HandleWebhookUseCase implements IHandleWebhookUseCase {
  constructor(
    @inject("IStripeService") private stripeService: IStripeService,
    @inject("IMembershipPlanRepository") private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = await this.stripeService.getWebhookEvent(rawBody, signature);
    } catch (error: any) {
      throw new CustomError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          const stripePaymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          const stripeSessionId = session.id;
          const clientId = session.metadata?.clientId;
          const planId = session.metadata?.planId;
          const paymentStatus = PaymentStatus.COMPLETED;

          if (!stripePaymentId || !clientId || !planId) {
            throw new CustomError("Missing payment intent ID, clientId, or planId", HTTP_STATUS.BAD_REQUEST);
          }

          if (!mongoose.Types.ObjectId.isValid(clientId)) {
            throw new CustomError("Invalid clientId format", HTTP_STATUS.BAD_REQUEST);
          }

          let sessionPayment = await this.paymentRepository.findByStripeSessionId(stripeSessionId);
          if (!sessionPayment) {
            const plan = await this.membershipPlanRepository.findById(planId);
            if (!plan) {
              throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
            }
            sessionPayment = await this.paymentRepository.save({
              clientId,
              membershipPlanId: plan.id,
              amount: session.amount_total ? session.amount_total / 100 : plan.price,
              adminAmount: (session.amount_total ? session.amount_total / 100 : plan.price) * 0.2,
              trainerAmount: (session.amount_total ? session.amount_total / 100 : plan.price) * 0.8,
              stripePaymentId,
              stripeSessionId,
              status: PaymentStatus.COMPLETED,
              createdAt: new Date(),
            });
          } else if (sessionPayment.status !== PaymentStatus.COMPLETED) {
            await this.paymentRepository.update(sessionPayment.id!, {
              stripePaymentId,
              status: PaymentStatus.COMPLETED,
              updatedAt: new Date(),
            });
          }

          const sessionClient = await this.clientRepository.findById(clientId);
          if (!sessionClient) {
            throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
          }

          const plan = await this.membershipPlanRepository.findById(planId);
          if (!plan) {
            throw new CustomError("Plan not found", HTTP_STATUS.NOT_FOUND);
          }

          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + plan.durationMonths);

          const updateResult = await this.clientRepository.update(clientId, {
            isPremium: true,
            membershipPlanId: plan.id,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
          });

          if (!updateResult) {
            throw new CustomError("Failed to update client subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
          break;

        case "payment_intent.created":
          const paymentIntentCreated = event.data.object as Stripe.PaymentIntent;
          const stripePaymentIdPIC = paymentIntentCreated.id;
          const clientIdPIC = paymentIntentCreated.metadata?.clientId;
          const stripeSessionIdPIC = paymentIntentCreated.metadata?.sessionId;
          const paymentExtraStatus = PaymentStatus.PENDING;

          if (!stripePaymentIdPIC || !clientIdPIC) {
            throw new CustomError("Missing payment intent ID or clientId", HTTP_STATUS.BAD_REQUEST);
          }

          let payment = await this.paymentRepository.findByStripeSessionId(stripeSessionIdPIC);
          if (!

 payment && stripeSessionIdPIC) {
            const planId = paymentIntentCreated.metadata?.planId;
            if (!planId) {
              throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
            }
            const plan = await this.membershipPlanRepository.findById(planId);
            if (!plan) {
              throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
            }
            payment = await this.paymentRepository.save({
              clientId: clientIdPIC,
              membershipPlanId: plan.id,
              amount: paymentIntentCreated.amount / 100,
              adminAmount: (paymentIntentCreated.amount / 100) * 0.2,
              trainerAmount: (paymentIntentCreated.amount / 100) * 0.8,
              stripePaymentId: stripePaymentIdPIC,
              stripeSessionId: stripeSessionIdPIC,
              status: PaymentStatus.PENDING,
              createdAt: new Date(),
            });
          } else if (payment) {
            await this.paymentRepository.update(payment.id!, {
              stripePaymentId: stripePaymentIdPIC,
              status: PaymentStatus.PENDING,
              updatedAt: new Date(),
            });
          }
          break;

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const stripePaymentIdPI = paymentIntent.id;
          const clientIdPI = paymentIntent.metadata?.clientId || paymentIntent.metadata?.userId;
          const paymentStatusPI = PaymentStatus.COMPLETED;

          if (!stripePaymentIdPI || !clientIdPI) {
            throw new CustomError("Missing payment intent ID or clientId", HTTP_STATUS.BAD_REQUEST);
          }

          if (!mongoose.Types.ObjectId.isValid(clientIdPI)) {
            throw new CustomError("Invalid clientId format", HTTP_STATUS.BAD_REQUEST);
          }

          let succeededPayment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdPI);
          if (!succeededPayment) {
            succeededPayment = await this.paymentRepository.findByStripeSessionId(paymentIntent.metadata?.sessionId);
            if (!succeededPayment) {
              const planId = paymentIntent.metadata?.planId;
              if (!planId) {
                throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
              }
              const plan = await this.membershipPlanRepository.findById(planId);
              if (!plan) {
                throw new CustomError("Membership plan not found", HTTP_STATUS.NOT_FOUND);
              }
              succeededPayment = await this.paymentRepository.save({
                clientId: clientIdPI,
                membershipPlanId: plan.id,
                amount: paymentIntent.amount / 100,
                adminAmount: (paymentIntent.amount / 100) * 0.2,
                trainerAmount: (paymentIntent.amount / 100) * 0.8,
                stripePaymentId: stripePaymentIdPI,
                stripeSessionId: paymentIntent.metadata?.sessionId,
                status: PaymentStatus.COMPLETED,
                createdAt: new Date(),
              });
            }
          }

          if (succeededPayment.status === PaymentStatus.COMPLETED) {
            break;
          }

          await this.paymentRepository.update(succeededPayment.id!, {
            status: PaymentStatus.COMPLETED,
            stripePaymentId: stripePaymentIdPI,
            updatedAt: new Date(),
          });
          break;

        case "charge.succeeded":
          const charge = event.data.object as Stripe.Charge;
          const stripePaymentIdCS = typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;

          if (!stripePaymentIdCS) {
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }

          let clientIdCS = charge.metadata?.clientId;
          if (!clientIdCS) {
            const payment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCS);
            const paymentClientId = payment?.clientId;
            if (!paymentClientId) {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
            clientIdCS = paymentClientId;
          }

          let chargePayment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCS);
          if (!chargePayment) {
            chargePayment = await this.paymentRepository.findOne({
              clientId: clientIdCS,
              status: PaymentStatus.PENDING,
            });
            if (!chargePayment) {
              throw new CustomError("No payment found for charge", HTTP_STATUS.NOT_FOUND);
            }
          }

          if (chargePayment.status === PaymentStatus.COMPLETED) {
            break;
          }

          await this.paymentRepository.update(chargePayment.id!, {
            status: PaymentStatus.COMPLETED,
            stripePaymentId: stripePaymentIdCS,
            updatedAt: new Date(),
          });
          break;

        case "charge.updated":
          const chargeUpdated = event.data.object as Stripe.Charge;
          const stripePaymentIdCU = typeof chargeUpdated.payment_intent === "string" ? chargeUpdated.payment_intent : chargeUpdated.payment_intent?.id;

          if (!stripePaymentIdCU) {
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }

          let clientIdCU = chargeUpdated.metadata?.clientId;
          if (!clientIdCU) {
            const payment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
            if (payment?.clientId !== undefined) {
              clientIdCU = payment.clientId;
            } else {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const updatedChargePayment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
          if (!updatedChargePayment) {
            throw new CustomError("No payment found for charge update", HTTP_STATUS.NOT_FOUND);
          }

          const paymentStatusCU = chargeUpdated.status === "succeeded" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
          if (updatedChargePayment.status === paymentStatusCU) {
            break;
          }

          await this.paymentRepository.update(updatedChargePayment.id!, {
            status: paymentStatusCU,
            updatedAt: new Date(),
          });
          break;

        default:
          break;
      }
    } catch (error: any) {
      throw error;
    }
  }
}