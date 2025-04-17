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
  
      const validatedData = createCheckoutSessionSchema.parse(req.body);
  
      const url = await this._createCheckoutSessionUseCase.execute({
        userId: req.user.id,
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

      console.log("Webhook raw body:", req.body.toString()); 
      console.log("Stripe signature header:", req.headers["stripe-signature"]);
      const event = await this._stripeService.getWebhookEvent(
        req.body,
        req.headers["stripe-signature"] as string
      );
      console.log("Received webhook event:", event);
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          await this._paymentRepository.updatePaymentStatus(
            session.id,
            PaymentStatus.COMPLETED,
            session.metadata?.userId
          );
          if (session.metadata?.userId) {
            await this._clientRepository.updatePremiumStatus(session.metadata.userId, true);
          }
          break;
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this._paymentRepository.updatePaymentStatus(
            paymentIntent.id,
            PaymentStatus.COMPLETED,
            paymentIntent.metadata?.userId
          );
          if (paymentIntent.metadata?.userId) {
            await this._clientRepository.updatePremiumStatus(paymentIntent.metadata.userId, true);
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
  
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
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