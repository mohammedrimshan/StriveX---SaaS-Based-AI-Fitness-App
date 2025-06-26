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
exports.DailyUnusedSessionProcessor = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const cron_1 = require("cron");
const constants_1 = require("@/shared/constants");
const mongoose_1 = __importDefault(require("mongoose"));
let DailyUnusedSessionProcessor = class DailyUnusedSessionProcessor {
    constructor(clientRepository, membershipPlanRepository, slotRepository, clientWalletRepository, walletTransactionRepository, paymentRepository, notificationService) {
        this.clientRepository = clientRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.slotRepository = slotRepository;
        this.clientWalletRepository = clientWalletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }
    start() {
        const job = new cron_1.CronJob("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Checking for unused sessions...");
                const today = new Date().toISOString().split("T")[0];
                const { items: clients } = yield this.clientRepository.find({ isPremium: true, subscriptionEndDate: { $gte: new Date() } }, 0, 1000);
                for (const client of clients) {
                    if (client && client.id) {
                        const clientId = client.id.toString();
                        const bookedSlots = yield this.slotRepository.findBookedSlotsByClientId(clientId);
                        const hasBookedToday = bookedSlots.some((slot) => slot.date === today);
                        if (!hasBookedToday) {
                            const plan = yield this.membershipPlanRepository.findById(client.membershipPlanId);
                            if (!plan) {
                                console.error(`Plan not found for client ${clientId}`);
                                continue;
                            }
                            const planDurationInDays = plan.durationMonths * 30;
                            const perSessionRate = plan.price / planDurationInDays;
                            const session = yield mongoose_1.default.startSession();
                            session.startTransaction();
                            try {
                                yield this.clientWalletRepository.updateBalance(clientId, perSessionRate, session);
                                yield this.walletTransactionRepository.save({
                                    clientId,
                                    amount: perSessionRate,
                                    type: constants_1.WalletTransactionType.REFUND,
                                    reason: "UNBOOKED_DAY",
                                    createdAt: new Date(),
                                }, session);
                                const payment = yield this.paymentRepository.findOne({
                                    clientId,
                                    membershipPlanId: client.membershipPlanId,
                                    status: constants_1.PaymentStatus.COMPLETED,
                                }, { createdAt: -1 });
                                if (payment && payment.id) {
                                    const newRemainingBalance = (payment.remainingBalance || plan.price) - perSessionRate;
                                    yield this.paymentRepository.updateById(payment.id, {
                                        remainingBalance: Math.max(newRemainingBalance, 0),
                                        updatedAt: new Date(),
                                    });
                                    console.log(`Updated remainingBalance to ${newRemainingBalance} for payment ${payment.id}`);
                                }
                                yield session.commitTransaction();
                                // ✅ Send notification
                                yield this.notificationService.sendToUser(clientId, "Session Refund", `₹${perSessionRate.toFixed(2)} has been refunded to your wallet for not booking a session today (${today}).`, "INFO");
                            }
                            catch (error) {
                                yield session.abortTransaction();
                                console.error(`Failed to refund for client ${clientId}:`, error);
                                continue;
                            }
                            finally {
                                session.endSession();
                            }
                            console.log(`Refunded ₹${perSessionRate} to wallet for client ${clientId} for unbooked day ${today}`);
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error in daily unused session check:", error);
            }
        }));
        job.start();
    }
};
exports.DailyUnusedSessionProcessor = DailyUnusedSessionProcessor;
exports.DailyUnusedSessionProcessor = DailyUnusedSessionProcessor = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(2, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(3, (0, tsyringe_1.inject)("IClientWalletRepository")),
    __param(4, (0, tsyringe_1.inject)("IWalletTransactionRepository")),
    __param(5, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(6, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, notification_service_1.NotificationService])
], DailyUnusedSessionProcessor);
