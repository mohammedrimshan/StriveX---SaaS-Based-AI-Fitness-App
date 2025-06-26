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
exports.HandleWebhookUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = __importDefault(require("mongoose"));
let HandleWebhookUseCase = class HandleWebhookUseCase {
    constructor(stripeService, membershipPlanRepository, paymentRepository, clientRepository) {
        this.stripeService = stripeService;
        this.membershipPlanRepository = membershipPlanRepository;
        this.paymentRepository = paymentRepository;
        this.clientRepository = clientRepository;
    }
    execute(rawBody, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            let event;
            try {
                event = yield this.stripeService.getWebhookEvent(rawBody, signature);
                console.log(`Processing webhook event: ${event.type} [${event.id}]`);
            }
            catch (error) {
                console.error(`Webhook signature verification failed: ${error.message}`);
                throw new custom_error_1.CustomError("Invalid webhook signature", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            try {
                switch (event.type) {
                    case "checkout.session.completed":
                        const session = event.data.object;
                        const stripePaymentId = typeof session.payment_intent === "string" ? session.payment_intent : (_a = session.payment_intent) === null || _a === void 0 ? void 0 : _a.id;
                        const stripeSessionId = session.id;
                        const clientId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.clientId; // This is the _id string
                        const planId = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.planId;
                        const paymentStatus = constants_1.PaymentStatus.COMPLETED;
                        console.log(`Checkout session completed: sessionId=${stripeSessionId}, clientId=${clientId}, planId=${planId}, paymentId=${stripePaymentId}`);
                        console.log(`Session metadata: ${JSON.stringify(session.metadata)}`);
                        if (!stripePaymentId || !clientId || !planId) {
                            console.error(`Missing metadata: clientId=${clientId}, planId=${planId}, paymentId=${stripePaymentId}`);
                            throw new custom_error_1.CustomError("Missing payment intent ID, clientId, or planId", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        // Validate clientId as a valid ObjectId
                        if (!mongoose_1.default.Types.ObjectId.isValid(clientId)) {
                            console.error(`Invalid ObjectId for clientId: ${clientId}`);
                            throw new custom_error_1.CustomError("Invalid clientId format", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        // Save or update payment record
                        let sessionPayment = yield this.paymentRepository.findByStripeSessionId(stripeSessionId);
                        if (!sessionPayment) {
                            const plan = yield this.membershipPlanRepository.findById(planId);
                            if (!plan) {
                                console.error(`Plan not found for planId: ${planId}`);
                                throw new custom_error_1.CustomError("Membership plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                            }
                            sessionPayment = yield this.paymentRepository.save({
                                clientId,
                                membershipPlanId: plan.id,
                                amount: session.amount_total ? session.amount_total / 100 : plan.price,
                                adminAmount: (session.amount_total ? session.amount_total / 100 : plan.price) * 0.2,
                                trainerAmount: (session.amount_total ? session.amount_total / 100 : plan.price) * 0.8,
                                stripePaymentId,
                                stripeSessionId,
                                status: constants_1.PaymentStatus.COMPLETED,
                                createdAt: new Date(),
                            });
                            console.log(`Saved new payment for clientId: ${clientId}, planId: ${planId}`);
                        }
                        else if (sessionPayment.status !== constants_1.PaymentStatus.COMPLETED) {
                            yield this.paymentRepository.update(sessionPayment.id, {
                                stripePaymentId,
                                status: constants_1.PaymentStatus.COMPLETED,
                                updatedAt: new Date(),
                            });
                            console.log(`Updated payment status to COMPLETED for sessionId: ${stripeSessionId}`);
                        }
                        // Find client by _id
                        const sessionClient = yield this.clientRepository.findById(clientId);
                        if (!sessionClient) {
                            console.error(`Client not found for _id: ${clientId}`);
                            throw new custom_error_1.CustomError("Client not found", constants_1.HTTP_STATUS.NOT_FOUND);
                        }
                        // Get plan details for subscription duration
                        const plan = yield this.membershipPlanRepository.findById(planId);
                        if (!plan) {
                            console.error(`Plan not found for planId: ${planId}`);
                            throw new custom_error_1.CustomError("Plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                        }
                        // Calculate subscription dates
                        const startDate = new Date();
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + plan.durationMonths);
                        // Update client subscription
                        const updateResult = yield this.clientRepository.update(clientId, {
                            isPremium: true,
                            membershipPlanId: plan.id,
                            subscriptionStartDate: startDate,
                            subscriptionEndDate: endDate,
                        });
                        if (!updateResult) {
                            console.error(`Failed to update client subscription for _id: ${clientId}`);
                            throw new custom_error_1.CustomError("Failed to update client subscription", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                        }
                        console.log(`Updated client subscription for _id: ${clientId}, isPremium: true, startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);
                        break;
                    case "payment_intent.created":
                        const paymentIntentCreated = event.data.object;
                        console.log(`Payment intent created: ${paymentIntentCreated.id}`);
                        const stripePaymentIdPIC = paymentIntentCreated.id;
                        const clientIdPIC = (_d = paymentIntentCreated.metadata) === null || _d === void 0 ? void 0 : _d.clientId;
                        const stripeSessionIdPIC = (_e = paymentIntentCreated.metadata) === null || _e === void 0 ? void 0 : _e.sessionId;
                        const paymentStatusPIC = constants_1.PaymentStatus.PENDING;
                        if (!stripePaymentIdPIC || !clientIdPIC) {
                            console.error(`Missing payment intent ID or clientId: paymentId=${stripePaymentIdPIC}, clientId=${clientIdPIC}`);
                            throw new custom_error_1.CustomError("Missing payment intent ID or clientId", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        let payment = yield this.paymentRepository.findByStripeSessionId(stripeSessionIdPIC);
                        if (!payment && stripeSessionIdPIC) {
                            const planId = (_f = paymentIntentCreated.metadata) === null || _f === void 0 ? void 0 : _f.planId;
                            if (!planId) {
                                console.error(`Missing planId in metadata for paymentId: ${stripePaymentIdPIC}`);
                                throw new custom_error_1.CustomError("Missing planId in metadata", constants_1.HTTP_STATUS.BAD_REQUEST);
                            }
                            const plan = yield this.membershipPlanRepository.findById(planId);
                            if (!plan) {
                                console.error(`Plan not found for planId: ${planId}`);
                                throw new custom_error_1.CustomError("Membership plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                            }
                            payment = yield this.paymentRepository.save({
                                clientId: clientIdPIC,
                                membershipPlanId: plan.id,
                                amount: paymentIntentCreated.amount / 100,
                                adminAmount: (paymentIntentCreated.amount / 100) * 0.2,
                                trainerAmount: (paymentIntentCreated.amount / 100) * 0.8,
                                stripePaymentId: stripePaymentIdPIC,
                                stripeSessionId: stripeSessionIdPIC,
                                status: constants_1.PaymentStatus.PENDING,
                                createdAt: new Date(),
                            });
                            console.log(`Saved pending payment for clientId: ${clientIdPIC}`);
                        }
                        else if (payment) {
                            yield this.paymentRepository.update(payment.id, {
                                stripePaymentId: stripePaymentIdPIC,
                                status: constants_1.PaymentStatus.PENDING,
                                updatedAt: new Date(),
                            });
                            console.log(`Updated pending payment for sessionId: ${stripeSessionIdPIC}`);
                        }
                        break;
                    case "payment_intent.succeeded":
                        const paymentIntent = event.data.object;
                        const stripePaymentIdPI = paymentIntent.id;
                        const clientIdPI = ((_g = paymentIntent.metadata) === null || _g === void 0 ? void 0 : _g.clientId) || ((_h = paymentIntent.metadata) === null || _h === void 0 ? void 0 : _h.userId);
                        const paymentStatusPI = constants_1.PaymentStatus.COMPLETED;
                        console.log(`Payment intent succeeded: ${stripePaymentIdPI}, clientId=${clientIdPI}`);
                        if (!stripePaymentIdPI || !clientIdPI) {
                            console.error(`Missing payment intent ID or clientId: paymentId=${stripePaymentIdPI}, clientId=${clientIdPI}`);
                            throw new custom_error_1.CustomError("Missing payment intent ID or clientId", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        if (!mongoose_1.default.Types.ObjectId.isValid(clientIdPI)) {
                            console.error(`Invalid ObjectId for clientId: ${clientIdPI}`);
                            throw new custom_error_1.CustomError("Invalid clientId format", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        let succeededPayment = yield this.paymentRepository.findByStripePaymentId(stripePaymentIdPI);
                        if (!succeededPayment) {
                            succeededPayment = yield this.paymentRepository.findByStripeSessionId((_j = paymentIntent.metadata) === null || _j === void 0 ? void 0 : _j.sessionId);
                            if (!succeededPayment) {
                                const planId = (_k = paymentIntent.metadata) === null || _k === void 0 ? void 0 : _k.planId;
                                if (!planId) {
                                    console.error(`Missing planId in metadata for paymentId: ${stripePaymentIdPI}`);
                                    throw new custom_error_1.CustomError("Missing planId in metadata", constants_1.HTTP_STATUS.BAD_REQUEST);
                                }
                                const plan = yield this.membershipPlanRepository.findById(planId);
                                if (!plan) {
                                    console.error(`Plan not found for planId: ${planId}`);
                                    throw new custom_error_1.CustomError("Membership plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                                }
                                succeededPayment = yield this.paymentRepository.save({
                                    clientId: clientIdPI,
                                    membershipPlanId: plan.id,
                                    amount: paymentIntent.amount / 100,
                                    adminAmount: (paymentIntent.amount / 100) * 0.2,
                                    trainerAmount: (paymentIntent.amount / 100) * 0.8,
                                    stripePaymentId: stripePaymentIdPI,
                                    stripeSessionId: (_l = paymentIntent.metadata) === null || _l === void 0 ? void 0 : _l.sessionId,
                                    status: constants_1.PaymentStatus.COMPLETED,
                                    createdAt: new Date(),
                                });
                                console.log(`Saved completed payment for clientId: ${clientIdPI}`);
                            }
                        }
                        if (succeededPayment.status === constants_1.PaymentStatus.COMPLETED) {
                            console.log(`Payment already completed for paymentId: ${stripePaymentIdPI}`);
                            break;
                        }
                        yield this.paymentRepository.update(succeededPayment.id, {
                            status: constants_1.PaymentStatus.COMPLETED,
                            stripePaymentId: stripePaymentIdPI,
                            updatedAt: new Date(),
                        });
                        console.log(`Updated payment status to COMPLETED for paymentId: ${stripePaymentIdPI}`);
                        break;
                    case "charge.succeeded":
                        const charge = event.data.object;
                        const stripePaymentIdCS = typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
                        console.log(`Charge succeeded: ${charge.id}, paymentId=${stripePaymentIdCS}`);
                        if (!stripePaymentIdCS) {
                            console.error(`Missing payment intent ID in charge: ${charge.id}`);
                            throw new custom_error_1.CustomError("Missing payment intent ID in charge", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        let clientIdCS = (_m = charge.metadata) === null || _m === void 0 ? void 0 : _m.clientId;
                        if (!clientIdCS) {
                            const payment = yield this.paymentRepository.findByStripePaymentId(stripePaymentIdCS);
                            const paymentClientId = payment === null || payment === void 0 ? void 0 : payment.clientId;
                            if (!paymentClientId) {
                                console.error(`Missing clientId in charge metadata and payment record for paymentId: ${stripePaymentIdCS}`);
                                throw new custom_error_1.CustomError("Missing clientId in metadata and payment record", constants_1.HTTP_STATUS.BAD_REQUEST);
                            }
                            clientIdCS = paymentClientId;
                        }
                        let chargePayment = yield this.paymentRepository.findByStripePaymentId(stripePaymentIdCS);
                        if (!chargePayment) {
                            chargePayment = yield this.paymentRepository.findOne({
                                clientId: clientIdCS,
                                status: constants_1.PaymentStatus.PENDING,
                            });
                            if (!chargePayment) {
                                console.error(`No payment found for charge: ${charge.id}`);
                                throw new custom_error_1.CustomError("No payment found for charge", constants_1.HTTP_STATUS.NOT_FOUND);
                            }
                        }
                        if (chargePayment.status === constants_1.PaymentStatus.COMPLETED) {
                            console.log(`Charge payment already completed for paymentId: ${stripePaymentIdCS}`);
                            break;
                        }
                        yield this.paymentRepository.update(chargePayment.id, {
                            status: constants_1.PaymentStatus.COMPLETED,
                            stripePaymentId: stripePaymentIdCS,
                            updatedAt: new Date(),
                        });
                        console.log(`Updated payment status to COMPLETED for charge paymentId: ${stripePaymentIdCS}`);
                        break;
                    case "charge.updated":
                        const chargeUpdated = event.data.object;
                        const stripePaymentIdCU = typeof chargeUpdated.payment_intent === "string" ? chargeUpdated.payment_intent : (_o = chargeUpdated.payment_intent) === null || _o === void 0 ? void 0 : _o.id;
                        console.log(`Charge updated: ${chargeUpdated.id}, paymentId=${stripePaymentIdCU}`);
                        if (!stripePaymentIdCU) {
                            console.error(`Missing payment intent ID in charge: ${chargeUpdated.id}`);
                            throw new custom_error_1.CustomError("Missing payment intent ID in charge", constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        let clientIdCU = (_p = chargeUpdated.metadata) === null || _p === void 0 ? void 0 : _p.clientId;
                        if (!clientIdCU) {
                            const payment = yield this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
                            if ((payment === null || payment === void 0 ? void 0 : payment.clientId) !== undefined) {
                                clientIdCU = payment.clientId;
                            }
                            else {
                                console.error(`Missing clientId in charge metadata and payment record for paymentId: ${stripePaymentIdCU}`);
                                throw new custom_error_1.CustomError("Missing clientId in metadata and payment record", constants_1.HTTP_STATUS.BAD_REQUEST);
                            }
                        }
                        const updatedChargePayment = yield this.paymentRepository.findByStripePaymentId(stripePaymentIdCU);
                        if (!updatedChargePayment) {
                            console.error(`No payment found for charge update: ${chargeUpdated.id}`);
                            throw new custom_error_1.CustomError("No payment found for charge update", constants_1.HTTP_STATUS.NOT_FOUND);
                        }
                        const paymentStatusCU = chargeUpdated.status === "succeeded" ? constants_1.PaymentStatus.COMPLETED : constants_1.PaymentStatus.PENDING;
                        if (updatedChargePayment.status === paymentStatusCU) {
                            console.log(`Charge payment status unchanged for paymentId: ${stripePaymentIdCU}`);
                            break;
                        }
                        yield this.paymentRepository.update(updatedChargePayment.id, {
                            status: paymentStatusCU,
                            updatedAt: new Date(),
                        });
                        console.log(`Updated payment status to ${paymentStatusCU} for charge paymentId: ${stripePaymentIdCU}`);
                        break;
                    default:
                        console.log(`Unhandled webhook event type: ${event.type}`);
                        break;
                }
            }
            catch (error) {
                console.error(`Error processing webhook event ${event.type} [${event.id}]: ${error.message}`);
                throw error;
            }
        });
    }
};
exports.HandleWebhookUseCase = HandleWebhookUseCase;
exports.HandleWebhookUseCase = HandleWebhookUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IStripeService")),
    __param(1, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(2, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(3, (0, tsyringe_1.inject)("IClientRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], HandleWebhookUseCase);
