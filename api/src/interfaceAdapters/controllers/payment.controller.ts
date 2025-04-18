import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPaymentController } from "@/entities/controllerInterfaces/payment-controller.interface";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { HTTP_STATUS, SUCCESS_MESSAGES, PaymentStatus, ERROR_MESSAGES } from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomError } from "@/entities/utils/custom.error";
import { ICreateCheckoutSessionUseCase } from "@/entities/useCaseInterfaces/stripe/create-checkout-session.usecase.interface";
import { createCheckoutSessionSchema } from "@/shared/validations/payment.schema";
import Stripe from "stripe";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject("IStripeService") private _stripeService: IStripeService,
    @inject("IMembershipPlanRepository") private _membershipPlanRepository: IMembershipPlanRepository,
    @inject("IPaymentRepository") private _paymentRepository: IPaymentRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ICreateCheckoutSessionUseCase") private _createCheckoutSessionUseCase: ICreateCheckoutSessionUseCase
  ) {}

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      // Fetch client to get clientId
      const client = await this._clientRepository.findById(req.user.id);
      if (!client || !client.clientId) {
        throw new CustomError("Client not found or missing clientId", HTTP_STATUS.NOT_FOUND);
      }

      const validatedData = createCheckoutSessionSchema.parse(req.body);

      const url = await this._createCheckoutSessionUseCase.execute({
        userId: client.clientId,
        planId: validatedData.planId,
        successUrl: validatedData.successUrl,
        cancelUrl: validatedData.cancelUrl,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        url,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const rawBody = (req as any).rawBody;
      const signature = req.headers["stripe-signature"] as string;
      console.log("Webhook raw body:", rawBody.toString());
      console.log("Stripe signature header:", signature);

      const event = await this._stripeService.getWebhookEvent(rawBody, signature);
      console.log("Received webhook event:", event);

      let stripePaymentId: string | undefined;
      let stripeSessionId: string | undefined;
      let clientId: string | undefined;
      let paymentStatus: PaymentStatus | undefined;
      let updatedClient: IClientEntity | null = null;

      switch (event.type) {
        case "payment_intent.created":
          const paymentIntentCreated = event.data.object as Stripe.PaymentIntent;
          stripePaymentId = paymentIntentCreated.id;
          clientId = paymentIntentCreated.metadata?.clientId;
          stripeSessionId = paymentIntentCreated.metadata?.sessionId;
          paymentStatus = PaymentStatus.PENDING;

          if (!stripePaymentId) {
            throw new CustomError("Missing payment intent ID", HTTP_STATUS.BAD_REQUEST);
          }

          if (stripeSessionId) {
            const existingPayment = await this._paymentRepository.findByStripeSessionId(stripeSessionId);
            if (existingPayment) {
              await this._paymentRepository.update(existingPayment.id!, {
                stripePaymentId,
                status: PaymentStatus.PENDING,
              });
            } else {
              const planId = paymentIntentCreated.metadata?.planId;
              if (!planId) {
                throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
              }
              if (!clientId) {
                throw new CustomError("Missing clientId in metadata", HTTP_STATUS.BAD_REQUEST);
              }
              const plan = await this._membershipPlanRepository.findById(planId);
              if (plan) {
                await this._paymentRepository.save({
                  clientId,
                  membershipPlanId: plan.id,
                  amount: paymentIntentCreated.amount / 100,
                  adminAmount: (paymentIntentCreated.amount / 100) * 0.2,
                  trainerAmount: (paymentIntentCreated.amount / 100) * 0.8,
                  stripePaymentId,
                  stripeSessionId,
                  status: PaymentStatus.PENDING,
                  createdAt: new Date(),
                });
              }
            }
          }
          break;

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          stripePaymentId = paymentIntent.id;
          clientId = paymentIntent.metadata?.clientId || paymentIntent.metadata?.userId; // Fallback to userId if clientId is missing
          paymentStatus = PaymentStatus.COMPLETED;

          if (!stripePaymentId) {
            throw new CustomError("Missing payment intent ID", HTTP_STATUS.BAD_REQUEST);
          }
          if (!clientId) {
            // Fallback: Retrieve clientId from payment record using stripePaymentId
            const payment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
            clientId = payment?.clientId;
            if (!clientId) {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const payment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
          if (payment && payment.status === PaymentStatus.COMPLETED) {
            console.log(`Payment ${stripePaymentId} already completed. Skipping update.`);
            break;
          }

          await this._paymentRepository.updatePaymentStatus(stripePaymentId, PaymentStatus.COMPLETED, clientId);
          updatedClient = await this._clientRepository.updatePremiumStatus(clientId, true);
          if (!updatedClient) {
            console.error(`Failed to update isPremium for clientId: ${clientId}`);
          }
          break;

        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          stripePaymentId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;
          stripeSessionId = session.id;
          clientId = session.metadata?.clientId;
          paymentStatus = PaymentStatus.COMPLETED;

          if (!stripePaymentId) {
            throw new CustomError("Missing payment intent ID in checkout session", HTTP_STATUS.BAD_REQUEST);
          }
          if (!clientId) {
            // Fallback: Retrieve clientId from payment record using stripeSessionId
            const payment = await this._paymentRepository.findByStripeSessionId(stripeSessionId);
            clientId = payment?.clientId;
            if (!clientId) {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const sessionPayment = await this._paymentRepository.findByStripeSessionId(stripeSessionId);
          if (sessionPayment) {
            if (sessionPayment.status === PaymentStatus.COMPLETED) {
              console.log(`Payment ${stripePaymentId} already completed. Skipping update.`);
              break;
            }
            await this._paymentRepository.update(sessionPayment.id!, {
              stripePaymentId,
              status: PaymentStatus.COMPLETED,
            });
          } else {
            console.log(`No payment found for session ${stripeSessionId}. Creating new payment.`);
            const planId = session.metadata?.planId;
            if (!planId) {
              throw new CustomError("Missing planId in metadata", HTTP_STATUS.BAD_REQUEST);
            }
            const plan = await this._membershipPlanRepository.findById(planId);
            if (plan) {
              await this._paymentRepository.save({
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
            }
          }

          updatedClient = await this._clientRepository.updatePremiumStatus(clientId, true);
          if (!updatedClient) {
            console.error(`Failed to update isPremium for clientId: ${clientId}`);
          }
          break;

        case "charge.succeeded":
          const charge = event.data.object as Stripe.Charge;
          stripePaymentId = typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
          clientId = charge.metadata?.clientId;
          paymentStatus = PaymentStatus.COMPLETED;

          if (!stripePaymentId) {
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }
          if (!clientId) {
            // Fallback: Retrieve clientId from payment record using stripePaymentId
            const payment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
            clientId = payment?.clientId;
            if (!clientId) {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const chargePayment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
          if (chargePayment && chargePayment.status === PaymentStatus.COMPLETED) {
            console.log(`Payment ${stripePaymentId} already completed. Skipping update.`);
            break;
          }

          await this._paymentRepository.updatePaymentStatus(stripePaymentId, PaymentStatus.COMPLETED, clientId);
          updatedClient = await this._clientRepository.updatePremiumStatus(clientId, true);
          if (!updatedClient) {
            console.error(`Failed to update isPremium for clientId: ${clientId}`);
          }
          break;

        case "charge.updated":
          const chargeUpdated = event.data.object as Stripe.Charge;
          stripePaymentId = typeof chargeUpdated.payment_intent === "string"
            ? chargeUpdated.payment_intent
            : chargeUpdated.payment_intent?.id;
          clientId = chargeUpdated.metadata?.clientId;
          paymentStatus = chargeUpdated.status === "succeeded" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

          if (!stripePaymentId) {
            throw new CustomError("Missing payment intent ID in charge", HTTP_STATUS.BAD_REQUEST);
          }
          if (!clientId) {
            // Fallback: Retrieve clientId from payment record using stripePaymentId
            const payment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
            clientId = payment?.clientId;
            if (!clientId) {
              throw new CustomError("Missing clientId in metadata and payment record", HTTP_STATUS.BAD_REQUEST);
            }
          }

          const updatedChargePayment = await this._paymentRepository.findByStripePaymentId(stripePaymentId);
          if (updatedChargePayment && updatedChargePayment.status === paymentStatus) {
            console.log(`Payment ${stripePaymentId} already in ${paymentStatus} state. Skipping update.`);
            break;
          }

          await this._paymentRepository.updatePaymentStatus(stripePaymentId, paymentStatus, clientId);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      console.error("Webhook error:", error);
      handleErrorResponse(res, error);
    }
  }

  async getMembershipPlans(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const plans = await this._membershipPlanRepository.findActivePlans();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        plans,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}