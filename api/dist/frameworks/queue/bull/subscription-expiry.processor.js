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
exports.SubscriptionExpiryProcessor = void 0;
const tsyringe_1 = require("tsyringe");
const cron_1 = require("cron");
const constants_1 = require("@/shared/constants");
const mongoose_1 = __importDefault(require("mongoose"));
let SubscriptionExpiryProcessor = class SubscriptionExpiryProcessor {
    constructor(clientRepository, clientWalletRepository, walletTransactionRepository, paymentRepository) {
        this.clientRepository = clientRepository;
        this.clientWalletRepository = clientWalletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.paymentRepository = paymentRepository;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const job = new cron_1.CronJob("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log("Checking for expired subscriptions...");
                    const { items: clients } = yield this.clientRepository.find({ isPremium: true, subscriptionEndDate: { $lte: new Date() } }, 0, 1000);
                    for (const client of clients) {
                        if (client && client.id) {
                            const clientId = client.id.toString();
                            const session = yield mongoose_1.default.startSession();
                            session.startTransaction();
                            try {
                                const payment = yield this.paymentRepository.findOne({
                                    clientId,
                                    membershipPlanId: client.membershipPlanId,
                                    status: constants_1.PaymentStatus.COMPLETED,
                                }, { createdAt: -1 });
                                if (!payment) {
                                    console.error(`Payment not found for client ${clientId}`);
                                    continue;
                                }
                                const refundAmount = payment.remainingBalance || 0;
                                if (refundAmount > 0) {
                                    yield this.clientWalletRepository.updateBalance(clientId, refundAmount, session);
                                    yield this.walletTransactionRepository.save({
                                        clientId,
                                        amount: refundAmount,
                                        type: constants_1.WalletTransactionType.REFUND,
                                        reason: "SUBSCRIPTION_EXPIRY",
                                        createdAt: new Date(),
                                    }, session);
                                    console.log(`Refunded ${refundAmount} to wallet for client ${clientId}`);
                                    yield this.paymentRepository.updateById(payment.id, {
                                        remainingBalance: 0,
                                        updatedAt: new Date(),
                                    });
                                }
                                yield this.clientRepository.updateByClientId(clientId, {
                                    isPremium: false,
                                    subscriptionStartDate: undefined,
                                    subscriptionEndDate: undefined,
                                    selectedTrainerId: undefined,
                                    selectStatus: constants_1.TrainerSelectionStatus.PENDING,
                                    matchedTrainers: [],
                                }, session);
                                console.log(`Subscription expired for client: ${clientId}`);
                                yield session.commitTransaction();
                            }
                            catch (error) {
                                yield session.abortTransaction();
                                console.error(`Failed to process expiry for client ${clientId}:`, error);
                                continue;
                            }
                            finally {
                                session.endSession();
                            }
                        }
                    }
                }
                catch (error) {
                    console.error("Error in subscription expiry check:", error);
                }
            }));
            job.start();
        });
    }
};
exports.SubscriptionExpiryProcessor = SubscriptionExpiryProcessor;
exports.SubscriptionExpiryProcessor = SubscriptionExpiryProcessor = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientWalletRepository")),
    __param(2, (0, tsyringe_1.inject)("IWalletTransactionRepository")),
    __param(3, (0, tsyringe_1.inject)("IPaymentRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SubscriptionExpiryProcessor);
