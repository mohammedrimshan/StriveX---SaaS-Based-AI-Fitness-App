import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPaymentController } from "@/entities/controllerInterfaces/payment-controller.interface";
import { ICreateCheckoutSessionUseCase } from "@/entities/useCaseInterfaces/stripe/create-checkout-session.usecase.interface";
import { IHandleWebhookUseCase } from "@/entities/useCaseInterfaces/stripe/handle-webhook.usecase.interface";
import { IUpgradeSubscriptionUseCase } from "@/entities/useCaseInterfaces/stripe/upgrade-subscription-usecase.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { IClientWalletRepository } from "@/entities/repositoryInterfaces/wallet/client-wallet.repository.interface";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { createCheckoutSessionSchema } from "@/shared/validations/payment.schema";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject("ICreateCheckoutSessionUseCase")
    private createCheckoutSessionUseCase: ICreateCheckoutSessionUseCase,
    @inject("IHandleWebhookUseCase")
    private handleWebhookUseCase: IHandleWebhookUseCase,
    @inject("IMembershipPlanRepository")
    private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IUpgradeSubscriptionUseCase")
    private upgradeSubscriptionUseCase: IUpgradeSubscriptionUseCase,
    @inject("IClientWalletRepository")
    private clientWalletRepository: IClientWalletRepository
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

      const url = await this.createCheckoutSessionUseCase.execute({
        userId: req.user.id,
        planId: validatedData.planId,
        successUrl: validatedData.successUrl,
        cancelUrl: validatedData.cancelUrl,
        useWalletBalance: validatedData.useWalletBalance,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        url,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const rawBody = (req as any).rawBody;
      const signature = req.headers["stripe-signature"] as string;

      await this.handleWebhookUseCase.execute(rawBody, signature);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
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

      const plans = await this.membershipPlanRepository.findActivePlans();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        plans,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async checkWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const wallet = await this.clientWalletRepository.findByClientId(
        req.user.id
      );
      const balance = wallet?.balance || 0;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        balance,
        hasBalance: balance > 0,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }

  async upgradeSubscription(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const validatedData = createCheckoutSessionSchema.parse(req.body);

      const url = await this.upgradeSubscriptionUseCase.execute({
        clientId: req.user.id,
        newPlanId: validatedData.planId,
        successUrl: validatedData.successUrl,
        cancelUrl: validatedData.cancelUrl,
        useWalletBalance: validatedData.useWalletBalance ?? false,
      });

      if (!url) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message:
            "Subscription upgraded successfully without additional payment.",
          url: null,
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.OPERATION_SUCCESS,
        url,
      });
    } catch (error) {
      handleErrorResponse(req,res, error);
    }
  }
}
