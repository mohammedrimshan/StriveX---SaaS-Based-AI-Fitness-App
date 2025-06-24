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
      console.log(`Processing webhook event: ${event.type} [${event.id}]`);
    } catch (error:any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      throw new CustomError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          const stripePaymentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          const stripeSessionId = session.id;
          const clientId = session.metadata?.clientId; // This is the _id string
          const planId = session.metadata?.planId;
          const paymentStatus = PaymentStatus.COMPLETED;

          console.log(`Checkout session completed: sessionId=${stripeSessionId}, clientId=${clientId}, planId=${planId}, paymentId=${stripePaymentId}`);
          console.log(`Session metadata: ${JSON.stringify(session.metadata)}`);

          if (!stripePaymentId || !clientId || !planId) {
            console.error(`Missing metadata: clientId=${clientId}, planId=${planId}, paymentId=${stripePaymentId}`);
            throw new CustomError("Missing payment intent ID, clientId, or planId", HTTP_STATUS.BAD_REQUEST);
          }

          // Validate clientId as a valid ObjectId
          if (!mongoose.Types.ObjectId.isValid(clientId)) {
            console.error(`Invalid ObjectId for clientId: ${clientId}`);
            throw new CustomError("Invalid clientId format", HTTP_STATUS.BAD_REQUEST);
          }

          // Save or update payment record
          let sessionPayment = await this.paymentRepository.findByStripeSessionId(stripeSessionId);
          if (!sessionPayment) {
            const plan = await this.membershipPlanRepository.findById(planId);
            if (!plan) {
              console.error(`Plan not found for planId: ${planId}`);
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
            console.log(`Saved new payment for clientId: ${clientId}, planId: ${planId}`);
          } else if (sessionPayment.status !== PaymentStatus.COMPLETED) {
            await this.paymentRepository.updatePayment(sessionPayment.id!, {
              stripePaymentId,
              status: PaymentStatus.COMPLETED,
              updatedAt: new Date(),
            });
            console.log(`Updated payment status to COMPLETED for sessionId: ${stripeSessionId}`);
          }

          // Find client by _id
          const sessionClient = await this.clientRepository.findById(clientId);
          if (!sessionClient) {
            console.error(`Client not found for _id: ${clientId}`);
            throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
          }

          // Get plan details for subscription duration
          const plan = await this.membershipPlanRepository.findById(planId);
          if (!plan) {
            console.error(`Plan not found for planId: ${planId}`);
            throw new CustomError("Plan not found", HTTP_STATUS.NOT_FOUND);
          }

          // Calculate subscription dates
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + plan.durationMonths);

          // Update client subscription
          const updateResult = await this.clientRepository.update(clientId, {
            isPremium: true,
            membershipPlanId:plan.id,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
          });

          if (!updateResult) {
            console.error(`Failed to update client subscription for _id: ${clientId}`);
            throw new CustomError("Failed to update client subscription", HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }

          console.log(`Updated client subscription for _id: ${clientId}, isPremium: true, startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);
          break;

        case "payment_intent.created":
          const paymentIntentCreated = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment intent created: ${paymentIntentCreated.id}`);
          const stripePaymentIdPIC = paymentIntentCreated.id;
          const clientIdPIC = paymentIntentCreated.metadata?.clientId;
          const stripeSessionIdPIC = paymentIntentCreated.metadata?.sessionId;
          const paymentStatusPIC = PaymentStatus.PENDING;

          if (!stripePaymentIdPIC || !clientIdPIC) {
            console.error(`Missing payment intent ID or clientId: paymentId=${stripePaymentIdPIC}, clientId=${clientIdPIC}`);
            throw new CustomError("Missing payment intent ID or clientId", HTTP_STATUS.BAD_REQUEST);
          }

          let payment = await this.paymentRepository.findByStripeSessionId(stripeSessionIdPIC);
          if (!payment && stripeSessionIdPIC) {
            const planId = paymentIntentCreated.metadata?.planId;
            if (!planId) {
              console.error(`Missing planId in metadata for paymentId: ${stripePaymentIdPIC}`);
              throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
            }
            const plan = await this.membershipPlanRepository.findById(planId);
            if (!plan) {
              console.error(`Plan not found for planId: ${planId}`);
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
            console.log(`Saved pending payment for clientId: ${clientIdPIC}`);
          } else if (payment) {
            await this.paymentRepository.updatePayment(payment.id!, {
              stripePaymentId: stripePaymentIdPIC,
              status: PaymentStatus.PENDING,
              updatedAt: new Date(),
            });
            console.log(`Updated pending payment for sessionId: ${stripeSessionIdPIC}`);
          }
          break;

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const stripePaymentIdPI = paymentIntent.id;
          const clientIdPI = paymentIntent.metadata?.clientId || paymentIntent.metadata?.userId;
          const paymentStatusPI = PaymentStatus.COMPLETED;

          console.log(`Payment intent succeeded: ${stripePaymentIdPI}, clientId=${clientIdPI}`);

          if (!stripePaymentIdPI || !clientIdPI) {
            console.error(`Missing payment intent ID or clientId: paymentId=${stripePaymentIdPI}, clientId=${clientIdPI}`);
            throw new CustomError("Missing payment intent ID or clientId", HTTP_STATUS.BAD_REQUEST);
          }

          if (!mongoose.Types.ObjectId.isValid(clientIdPI)) {
            console.error(`Invalid ObjectId for clientId: ${clientIdPI}`);
            throw new CustomError("Invalid clientId format", HTTP_STATUS.BAD_REQUEST);
          }

          let succeededPayment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdPI);
          if (!succeededPayment) {
            succeededPayment = await this.paymentRepository.findByStripeSessionId(paymentIntent.metadata?.sessionId);
            if (!succeededPayment) {
              const planId = paymentIntent.metadata?.planId;
              if (!planId) {
                console.error(`Missing planId in metadata for paymentId: ${stripePaymentIdPI}`);
                throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
              }
              const plan = await this.membershipPlanRepository.findById(planId);
              if (!plan) {
                console.error(`Plan not found for planId: ${planId}`);
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
              console.log(`Saved completed payment for clientId: ${clientIdPI}`);
            }
          }

          if (succeededPayment.status === PaymentStatus.COMPLETED) {
            console.log(`Payment already completed for paymentId: ${stripePaymentIdPI}`);
            break;
          }

          await this.paymentRepository.updatePayment(succeededPayment.id!, {
            status: PaymentStatus.COMPLETED,
            stripePaymentId: stripePaymentIdPI,
            updatedAt: new Date(),
          });
          console.log(`Updated payment status to COMPLETED for paymentId: ${stripePaymentIdPI}`);
          break;

        case "charge.succeeded":
          const charge = event.data.object as Stripe.Charge;
          const stripePaymentIdCS = typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
          console.log(`Charge succeeded: ${charge.id}, paymentId=${stripePaymentIdCS}`);

          if (!stripePaymentIdCS) {
            console.error(`Missing payment intent ID in charge: ${charge.id}`);
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }

          let clientIdCS = charge.metadata?.clientId;
          if (!clientIdCS) {
            const payment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCS);
            const paymentClientId = payment?.clientId;
            if (!paymentClientId) {
              console.error(`Missing clientId in charge metadata and payment record for paymentId: ${stripePaymentIdCS}`);
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
              console.error(`No payment found for charge: ${charge.id}`);
              throw new CustomError("No payment found for charge", HTTP_STATUS.NOT_FOUND);
            }
          }

          if (chargePayment.status === PaymentStatus.COMPLETED) {
            console.log(`Charge payment already completed for paymentId: ${stripePaymentIdCS}`);
            break;
          }

          await this.paymentRepository.updatePayment(chargePayment.id!, {
            status: PaymentStatus.COMPLETED,
            stripePaymentId: stripePaymentIdCS,
            updatedAt: new Date(),
          });
          console.log(`Updated payment status to COMPLETED for charge paymentId: ${stripePaymentIdCS}`);
          break;

        case "charge.updated":
          const chargeUpdated = event.data.object as Stripe.Charge;
          const stripePaymentIdCU = typeof chargeUpdated.payment_intent === "string" ? chargeUpdated.payment_intent : chargeUpdated.payment_intent?.id;
          console.log(`Charge updated: ${chargeUpdated.id}, paymentId=${stripePaymentIdCU}`);

          if (!stripePaymentIdCU) {
            console.error(`Missing payment intent ID in charge: ${chargeUpdated.id}`);
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }

          let clientIdCU = chargeUpdated.metadata?.clientId;
          if (!clientIdCU) {
            const payment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
            if (payment?.clientId !== undefined) {
              clientIdCU = payment.clientId;
            } else {
              console.error(`Missing clientId in charge metadata and payment record for paymentId: ${stripePaymentIdCU}`);
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const updatedChargePayment = await this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
          if (!updatedChargePayment) {
            console.error(`No payment found for charge update: ${chargeUpdated.id}`);
            throw new CustomError("No payment found for charge update", HTTP_STATUS.NOT_FOUND);
          }

          const paymentStatusCU = chargeUpdated.status === "succeeded" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
          if (updatedChargePayment.status === paymentStatusCU) {
            console.log(`Charge payment status unchanged for paymentId: ${stripePaymentIdCU}`);
            break;
          }

          await this.paymentRepository.updatePayment(updatedChargePayment.id!, {
            status: paymentStatusCU,
            updatedAt: new Date(),
          });
          console.log(`Updated payment status to ${paymentStatusCU} for charge paymentId: ${stripePaymentIdCU}`);
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          break;
      }
    } catch (error: any) {
      console.error(`Error processing webhook event ${event.type} [${event.id}]: ${error.message}`);
      throw error;
    }
  } 
}