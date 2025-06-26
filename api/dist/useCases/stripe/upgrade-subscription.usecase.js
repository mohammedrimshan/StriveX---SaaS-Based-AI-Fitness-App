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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeSubscriptionUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let UpgradeSubscriptionUseCase = class UpgradeSubscriptionUseCase {
    constructor(clientRepository, membershipPlanRepository, paymentRepository, stripeService, clientWalletRepository, walletTransactionRepository) {
        this.clientRepository = clientRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
        this.clientWalletRepository = clientWalletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }
    execute(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { clientId, newPlanId, successUrl, cancelUrl, useWalletBalance = false } = data;
            console.log(`[${new Date().toISOString()}] [UpgradeSubscriptionUseCase] Start: clientId=${clientId}, newPlanId=${newPlanId}, useWalletBalance=${useWalletBalance}`);
            try {
                // Check for existing pending payment
                console.log(`[${new Date().toISOString()}] Checking for existing pending payment for clientId: ${clientId}, newPlanId: ${newPlanId}`);
                const existingPayment = yield this.paymentRepository.findOne({
                    clientId,
                    membershipPlanId: newPlanId,
                    status: constants_1.PaymentStatus.PENDING,
                });
                if (existingPayment && existingPayment.stripeSessionId) {
                    console.log(`[${new Date().toISOString()}] Reusing existing pending payment: ${existingPayment.id}`);
                    const stripeSession = yield this.stripeService.getCheckoutSessionByUrl(existingPayment.stripeSessionId);
                    if (stripeSession.url) {
                        return stripeSession.url;
                    }
                }
                // Validate client
                console.log(`[${new Date().toISOString()}] Validating client: ${clientId}`);
                const client = yield this.clientRepository.findById(clientId);
                if (!client || !client.isPremium || !client.subscriptionEndDate) {
                    console.error(`[${new Date().toISOString()}] No active premium subscription for clientId: ${clientId}`);
                    throw new custom_error_1.CustomError("No active premium subscription", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate new plan
                console.log(`[${new Date().toISOString()}] Validating plan: ${newPlanId}`);
                const newPlan = yield this.membershipPlanRepository.findById(newPlanId);
                if (!newPlan) {
                    console.error(`[${new Date().toISOString()}] Membership plan not found: ${newPlanId}`);
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MEMBERSHIP_NOT_FOUND, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate current payment
                console.log(`[${new Date().toISOString()}] Finding current payment for clientId: ${clientId}`);
                const currentPayment = yield this.paymentRepository.findOne({
                    clientId,
                    status: constants_1.PaymentStatus.COMPLETED,
                });
                if (!currentPayment) {
                    console.error(`[${new Date().toISOString()}] No completed payment found for clientId: ${clientId}`);
                    throw new custom_error_1.CustomError("No completed payment found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                // Validate current plan
                console.log(`[${new Date().toISOString()}] Validating plan: ${currentPayment.membershipPlanId}`);
                const currentPlan = yield this.membershipPlanRepository.findById(currentPayment.membershipPlanId);
                if (!currentPlan) {
                    console.error(`[${new Date().toISOString()}] Current plan not found: ${currentPayment.membershipPlanId}`);
                    throw new custom_error_1.CustomError("Current plan not found", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (currentPlan.id === newPlan.id) {
                    console.error(`[${new Date().toISOString()}] Attempted to upgrade to the same plan: ${newPlan.id}`);
                    throw new custom_error_1.CustomError("Cannot upgrade to the same plan", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Calculate proration credit
                console.log(`[${new Date().toISOString()}] Calculating proration credit`);
                const now = new Date();
                const remainingDays = Math.ceil((client.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const prorationCredit = (remainingDays / 30) * currentPlan.price;
                console.log(`[${new Date().toISOString()}] Proration credit: ${prorationCredit}, remainingDays: ${remainingDays}`);
                // Step 1: Subtract proration credit from new plan price
                let amountToCharge = newPlan.price - prorationCredit;
                amountToCharge = Math.max(amountToCharge, 0);
                // Step 2: Apply wallet balance
                let walletBalance = 0;
                let walletUsedAmount = 0;
                if (useWalletBalance) {
                    console.log(`[${new Date().toISOString()}] Checking wallet balance for clientId: ${clientId}`);
                    const wallet = yield this.clientWalletRepository.findByClientId(clientId);
                    if (!wallet) {
                        console.error(`[${new Date().toISOString()}] No wallet found for clientId: ${clientId}`);
                        throw new custom_error_1.CustomError("No wallet found", constants_1.HTTP_STATUS.BAD_REQUEST);
                    }
                    walletBalance = wallet.balance || 0;
                    console.log(`[${new Date().toISOString()}] Wallet balance for clientId ${clientId}: ${walletBalance}`);
                    if (walletBalance > 0) {
                        walletUsedAmount = Math.min(walletBalance, amountToCharge);
                        amountToCharge -= walletUsedAmount;
                        amountToCharge = Math.max(amountToCharge, 0);
                    }
                    else {
                        console.log(`[${new Date().toISOString()}] Insufficient wallet balance for clientId: ${clientId}`);
                    }
                }
                console.log(`[${new Date().toISOString()}] Amount to charge after proration and wallet applied: ${amountToCharge}, walletUsedAmount: ${walletUsedAmount}`);
                // Determine trainerId
                let trainerId;
                if (client.selectedTrainerId && client.selectStatus === constants_1.TrainerSelectionStatus.ACCEPTED) {
                    trainerId = client.selectedTrainerId;
                    console.log(`[${new Date().toISOString()}] Trainer ID assigned: ${trainerId}`);
                }
                // Deduct wallet balance if used
                if (walletUsedAmount > 0) {
                    console.log(`[${new Date().toISOString()}] Deducting wallet balance: ${walletUsedAmount}`);
                    const walletBefore = yield this.clientWalletRepository.findByClientId(clientId);
                    if (!walletBefore) {
                        console.error(`[${new Date().toISOString()}] No wallet found for clientId: ${clientId} during wallet deduction`);
                        throw new custom_error_1.CustomError("No wallet found", constants_1.HTTP_STATUS.BAD_REQUEST);
                    }
                    console.log(`[${new Date().toISOString()}] Wallet balance before deduction: ${walletBefore.balance}`);
                    const updatedWallet = yield this.clientWalletRepository.updateBalance(clientId, -walletUsedAmount);
                    if (!updatedWallet || updatedWallet.balance < 0) {
                        console.error(`[${new Date().toISOString()}] Failed to update wallet balance for clientId: ${clientId}, new balance: ${updatedWallet === null || updatedWallet === void 0 ? void 0 : updatedWallet.balance}`);
                        throw new custom_error_1.CustomError("Failed to update wallet balance or insufficient balance", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                    }
                    console.log(`[${new Date().toISOString()}] Wallet balance updated, new balance: ${updatedWallet.balance}`);
                    yield this.walletTransactionRepository.save({
                        clientId,
                        amount: walletUsedAmount,
                        type: constants_1.WalletTransactionType.WITHDRAWAL,
                        reason: `SUBSCRIPTION_${newPlan.id}_WALLET`,
                        createdAt: new Date(),
                    });
                    console.log(`[${new Date().toISOString()}] Wallet transaction recorded for clientId: ${clientId}, amount: ${walletUsedAmount}`);
                }
                if (amountToCharge <= 0) {
                    // Wallet fully covers amount, no Stripe payment needed
                    console.log(`[${new Date().toISOString()}] No Stripe payment needed, processing wallet-only payment`);
                    try {
                        // Save payment record
                        const payment = {
                            id: new mongoose_1.default.Types.ObjectId().toString(),
                            clientId,
                            membershipPlanId: newPlan.id,
                            amount: newPlan.price,
                            adminAmount: newPlan.price * 0.2,
                            trainerAmount: newPlan.price * 0.8,
                            trainerId,
                            status: constants_1.PaymentStatus.COMPLETED,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            remainingBalance: 0,
                            walletAppliedAmount: walletUsedAmount,
                            paymentSource: "WALLET",
                            stripeSessionId: undefined,
                            stripePaymentId: undefined,
                        };
                        yield this.paymentRepository.save(payment);
                        console.log(`[${new Date().toISOString()}] Payment saved: ${payment.id}`);
                        // Update client subscription
                        console.log(`[${new Date().toISOString()}] Updating client subscription for clientId: ${clientId}`);
                        const startDate = new Date();
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + newPlan.durationMonths);
                        const updated = yield this.clientRepository.update(clientId, {
                            isPremium: true,
                            membershipPlanId: newPlan.id,
                            subscriptionStartDate: startDate,
                            subscriptionEndDate: endDate,
                        });
                        if (!updated) {
                            console.error(`[${new Date().toISOString()}] Failed to update client subscription for clientId: ${clientId}`);
                            // Rollback payment and wallet changes
                            if (walletUsedAmount > 0) {
                                yield this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
                                yield this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
                            }
                            yield this.paymentRepository.deleteById(payment.id);
                            throw new custom_error_1.CustomError("Failed to update client subscription", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                        }
                        console.log(`[${new Date().toISOString()}] Client subscription updated for clientId: ${clientId}`);
                        return `${successUrl}?source=wallet`; // Return wallet-specific success URL
                    }
                    catch (error) {
                        console.error(`[${new Date().toISOString()}] Error processing wallet-only payment for clientId: ${clientId}, error: ${error instanceof Error ? error.message : String(error)}`);
                        // Rollback wallet changes if payment or client update fails
                        if (walletUsedAmount > 0) {
                            yield this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
                            yield this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
                        }
                        throw error instanceof Error ? error : new custom_error_1.CustomError(String(error), constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                    }
                }
                // Create Stripe checkout session for remaining amount
                console.log(`[${new Date().toISOString()}] Creating Stripe checkout session for amount: ${amountToCharge}`);
                const session = yield this.stripeService.createCheckoutSession(clientId, { id: newPlan.id, price: amountToCharge, name: newPlan.name }, successUrl, cancelUrl, { clientId, planId: newPlan.id, walletAppliedAmount: walletUsedAmount.toString() });
                // Save pending payment record
                const payment = {
                    id: new mongoose_1.default.Types.ObjectId().toString(),
                    clientId,
                    membershipPlanId: newPlan.id,
                    amount: newPlan.price,
                    adminAmount: newPlan.price * 0.2,
                    trainerAmount: newPlan.price * 0.8,
                    trainerId,
                    stripeSessionId: session.sessionId,
                    status: constants_1.PaymentStatus.PENDING,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    remainingBalance: amountToCharge,
                    walletAppliedAmount: walletUsedAmount,
                    paymentSource: walletUsedAmount > 0 ? "MIXED" : "STRIPE",
                };
                try {
                    yield this.paymentRepository.save(payment);
                    console.log(`[${new Date().toISOString()}] Pending payment saved: ${payment.id}, stripeSessionId: ${session.sessionId}`);
                }
                catch (error) {
                    console.error(`[${new Date().toISOString()}] Error saving pending payment for clientId: ${clientId}, error: ${error instanceof Error ? error.message : String(error)}`);
                    // Rollback wallet changes if payment save fails
                    if (walletUsedAmount > 0) {
                        yield this.clientWalletRepository.updateBalance(clientId, walletUsedAmount); // Restore wallet balance
                        yield this.walletTransactionRepository.deleteByReason(`SUBSCRIPTION_${newPlan.id}_WALLET`);
                    }
                    throw error instanceof Error ? error : new custom_error_1.CustomError(String(error), constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                return session.url;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`[${new Date().toISOString()}] Error in UpgradeSubscriptionUseCase for clientId: ${clientId}, error: ${errorMessage}`);
                throw error;
            }
        });
    }
};
exports.UpgradeSubscriptionUseCase = UpgradeSubscriptionUseCase;
exports.UpgradeSubscriptionUseCase = UpgradeSubscriptionUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(2, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(3, (0, tsyringe_1.inject)("IStripeService")),
    __param(4, (0, tsyringe_1.inject)("IClientWalletRepository")),
    __param(5, (0, tsyringe_1.inject)("IWalletTransactionRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], UpgradeSubscriptionUseCase);
