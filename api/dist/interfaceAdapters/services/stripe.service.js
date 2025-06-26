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
exports.StripeService = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let StripeService = class StripeService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-03-31.basil",
        });
        console.log(`[${new Date().toISOString()}] Webhook secret loaded: ${process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing'}`);
    }
    createConnectAccount(trainerId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const account = yield this.stripe.accounts.create({
                    type: "express",
                    email,
                    metadata: { trainerId },
                });
                console.log(`[${new Date().toISOString()}] Created Stripe connect account: ${account.id} for trainerId: ${trainerId}`);
                return account.id;
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to create connect account: ${error.message}`);
                throw new custom_error_1.CustomError("Failed to create connect account", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    createCheckoutSession(clientId, plan, successUrl, cancelUrl, metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[${new Date().toISOString()}] Creating checkout session with metadata: ${JSON.stringify(metadata)}`);
                const session = yield this.stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price_data: {
                                currency: "usd",
                                product_data: {
                                    name: plan.name,
                                    metadata: { planId: plan.id, clientId },
                                },
                                unit_amount: Math.round(plan.price * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: {
                        clientId,
                        planId: plan.id,
                        paymentId: (metadata === null || metadata === void 0 ? void 0 : metadata.paymentId) || "",
                        walletAppliedAmount: (metadata === null || metadata === void 0 ? void 0 : metadata.walletAppliedAmount) || "0",
                        sessionId: "<will be set after creation>",
                    },
                    payment_intent_data: {
                        metadata: {
                            clientId,
                            paymentId: (metadata === null || metadata === void 0 ? void 0 : metadata.paymentId) || "",
                            planId: plan.id,
                        },
                    },
                });
                if (!session.url || !session.id) {
                    console.error(`[${new Date().toISOString()}] Failed to create checkout session: missing url or id`);
                    throw new custom_error_1.CustomError("Failed to create checkout session", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                try {
                    yield this.stripe.checkout.sessions.update(session.id, {
                        metadata: {
                            clientId,
                            planId: plan.id,
                            paymentId: (metadata === null || metadata === void 0 ? void 0 : metadata.paymentId) || "",
                            walletAppliedAmount: (metadata === null || metadata === void 0 ? void 0 : metadata.walletAppliedAmount) || "0",
                            sessionId: session.id,
                        },
                    });
                    console.log(`[${new Date().toISOString()}] Updated checkout session ${session.id} with metadata`);
                }
                catch (error) {
                    console.error(`[${new Date().toISOString()}] Failed to update checkout session metadata: ${error.message}`);
                    throw new custom_error_1.CustomError("Failed to update checkout session metadata", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                return { url: session.url, sessionId: session.id };
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to create checkout session: ${error.message}`);
                throw new custom_error_1.CustomError("Failed to create checkout session", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getCheckoutSessionByUrl(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.stripe.checkout.sessions.retrieve(sessionId);
                console.log(`[${new Date().toISOString()}] Retrieved checkout session: ${sessionId}`);
                return session;
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to retrieve checkout session: ${error.message}`);
                throw new custom_error_1.CustomError("Failed to retrieve checkout session", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
    createTransfer(amount, stripeConnectId, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transfer = yield this.stripe.transfers.create({
                    amount: amount * 100,
                    currency: "usd",
                    destination: stripeConnectId,
                    source_transaction: paymentIntentId,
                });
                console.log(`[${new Date().toISOString()}] Created transfer: ${transfer.id} for paymentIntentId: ${paymentIntentId}`);
                return transfer;
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to create transfer: ${error.message}`);
                throw new custom_error_1.CustomError("Failed to create transfer", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getWebhookEvent(body, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const event = this.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
                console.log(`[${new Date().toISOString()}] Webhook event constructed: ${event.id}`);
                return event;
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Invalid webhook signature: ${error.message}`);
                throw new custom_error_1.CustomError("Invalid webhook signature", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
    createAccountLink(accountId, refreshUrl, returnUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountLink = yield this.stripe.accountLinks.create({
                    account: accountId,
                    refresh_url: refreshUrl,
                    return_url: returnUrl,
                    type: "account_onboarding",
                });
                console.log(`[${new Date().toISOString()}] Created account link for accountId: ${accountId}`);
                return accountLink.url;
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Failed to create account link: ${error.message}`);
                throw new custom_error_1.CustomError("Failed to create account link", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);
