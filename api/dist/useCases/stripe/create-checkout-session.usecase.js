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
exports.CreateCheckoutSessionUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let CreateCheckoutSessionUseCase = class CreateCheckoutSessionUseCase {
    constructor(stripeService, membershipPlanRepository, paymentRepository, clientWalletRepository, walletTransactionRepository) {
        this._stripeService = stripeService;
        this._membershipPlanRepository = membershipPlanRepository;
        this._paymentRepository = paymentRepository;
        this._clientWalletRepository = clientWalletRepository;
        this._walletTransactionRepository = walletTransactionRepository;
    }
    execute(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId: clientId, planId, successUrl, cancelUrl } = data;
            if (!clientId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_REQUIRED, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const plan = yield this._membershipPlanRepository.findById(planId);
            if (!plan || !plan.id) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const wallet = yield this._clientWalletRepository.findByClientId(clientId);
            const walletBalance = (wallet === null || wallet === void 0 ? void 0 : wallet.balance) || 0;
            const amountToCharge = Math.max(plan.price - walletBalance, 0);
            const { url, sessionId } = yield this._stripeService.createCheckoutSession(clientId, { id: plan.id, price: amountToCharge, name: plan.name }, successUrl, cancelUrl);
            const payment = {
                clientId,
                membershipPlanId: plan.id,
                amount: plan.price,
                adminAmount: plan.price * 0.2,
                trainerAmount: plan.price * 0.8,
                stripeSessionId: sessionId,
                status: constants_1.PaymentStatus.PENDING,
                createdAt: new Date(),
                remainingBalance: plan.price
            };
            yield this._paymentRepository.save(payment);
            if (walletBalance > 0) {
                yield this._clientWalletRepository.updateBalance(clientId, -walletBalance);
                yield this._walletTransactionRepository.save({
                    clientId,
                    amount: walletBalance,
                    type: constants_1.WalletTransactionType.WITHDRAWAL,
                    reason: "PLAN_SUBSCRIPTION",
                    createdAt: new Date(),
                });
            }
            return url;
        });
    }
};
exports.CreateCheckoutSessionUseCase = CreateCheckoutSessionUseCase;
exports.CreateCheckoutSessionUseCase = CreateCheckoutSessionUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IStripeService")),
    __param(1, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(2, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(3, (0, tsyringe_1.inject)("IClientWalletRepository")),
    __param(4, (0, tsyringe_1.inject)("IWalletTransactionRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CreateCheckoutSessionUseCase);
