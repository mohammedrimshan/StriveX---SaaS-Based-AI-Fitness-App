"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const payment_schema_1 = require("@/shared/validations/payment.schema");
let PaymentController = class PaymentController {
    constructor(createCheckoutSessionUseCase, handleWebhookUseCase, membershipPlanRepository, upgradeSubscriptionUseCase, clientWalletRepository) {
        this.createCheckoutSessionUseCase = createCheckoutSessionUseCase;
        this.handleWebhookUseCase = handleWebhookUseCase;
        this.membershipPlanRepository = membershipPlanRepository;
        this.upgradeSubscriptionUseCase = upgradeSubscriptionUseCase;
        this.clientWalletRepository = clientWalletRepository;
    }
    createCheckoutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
                    });
                    return;
                }
                const validatedData = payment_schema_1.createCheckoutSessionSchema.parse(req.body);
                const url = yield this.createCheckoutSessionUseCase.execute({
                    userId: req.user.id,
                    planId: validatedData.planId,
                    successUrl: validatedData.successUrl,
                    cancelUrl: validatedData.cancelUrl,
                    useWalletBalance: validatedData.useWalletBalance, // Pass useWalletBalance
                });
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    url,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    handleWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rawBody = req.rawBody;
                const signature = req.headers["stripe-signature"];
                console.log("Webhook raw body:", rawBody.toString());
                console.log("Stripe signature header:", signature);
                yield this.handleWebhookUseCase.execute(rawBody, signature);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                });
            }
            catch (error) {
                console.error("Webhook error:", error);
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getMembershipPlans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
                    });
                    return;
                }
                const plans = yield this.membershipPlanRepository.findActivePlans();
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    plans,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    checkWalletBalance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
                    });
                    return;
                }
                const wallet = yield this.clientWalletRepository.findByClientId(req.user.id);
                const balance = (wallet === null || wallet === void 0 ? void 0 : wallet.balance) || 0;
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    balance,
                    hasBalance: balance > 0,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    upgradeSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
                    });
                    return;
                }
                // Validate request body
                const validatedData = payment_schema_1.createCheckoutSessionSchema.parse(req.body);
                console.log("Validated request data:", validatedData);
                // Call use case
                const url = yield this.upgradeSubscriptionUseCase.execute({
                    clientId: req.user.id,
                    newPlanId: validatedData.planId,
                    successUrl: validatedData.successUrl,
                    cancelUrl: validatedData.cancelUrl,
                    useWalletBalance: (_a = validatedData.useWalletBalance) !== null && _a !== void 0 ? _a : false,
                });
                // If URL is empty string => no payment required, upgrade done
                if (!url) {
                    res.status(constants_1.HTTP_STATUS.OK).json({
                        success: true,
                        message: "Subscription upgraded successfully without additional payment.",
                        url: null,
                    });
                    return;
                }
                // Otherwise, return Stripe checkout URL
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    url,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.PaymentController = PaymentController;
exports.PaymentController = PaymentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateCheckoutSessionUseCase")),
    __param(1, (0, tsyringe_1.inject)("IHandleWebhookUseCase")),
    __param(2, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(3, (0, tsyringe_1.inject)("IUpgradeSubscriptionUseCase")),
    __param(4, (0, tsyringe_1.inject)("IClientWalletRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], PaymentController);
