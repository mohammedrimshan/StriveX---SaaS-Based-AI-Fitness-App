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
exports.GetTransactionHistoryUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GetTransactionHistoryUseCase = class GetTransactionHistoryUseCase {
    constructor(paymentRepository, membershipPlanRepository, clientRepository) {
        this.paymentRepository = paymentRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.clientRepository = clientRepository;
    }
    execute(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, role, page = 1, limit = 10, search, status } = params;
            const filter = {};
            if (userId && role) {
                filter[role === "client" ? "clientId" : "trainerId"] = userId;
            }
            if (status && status !== "all") {
                filter.status = status;
            }
            const skip = (page - 1) * limit;
            const { items: transactions, total: totalTransactions } = yield this.paymentRepository.find(filter, skip, limit);
            const clientIds = [...new Set(transactions.map((t) => t.clientId))];
            // Fetch clients using findByClientNewId
            const clients = yield Promise.all(clientIds.map((clientId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const client = yield this.clientRepository.findByClientNewId(clientId);
                    return {
                        id: clientId, // Use the original clientId from the payment
                        name: client
                            ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || "Unknown User"
                            : "Unknown User",
                    };
                }
                catch (error) {
                    console.warn(`Error fetching client for clientId: ${clientId}`, error);
                    return { id: clientId, name: "Unknown User" };
                }
            })));
            let filteredClients = clients;
            if (search) {
                filteredClients = clients.filter((client) => client.name.toLowerCase().includes(search.toLowerCase()));
            }
            const filteredClientIds = filteredClients.map((client) => client.id);
            const clientMap = new Map(filteredClients.map((client) => [client.id, client.name]));
            let finalTransactions = transactions;
            let total = totalTransactions;
            if (search) {
                finalTransactions = transactions.filter((transaction) => filteredClientIds.includes(transaction.clientId));
                total = finalTransactions.length;
            }
            const membershipPlanIds = [
                ...new Set(finalTransactions.map((t) => t.membershipPlanId)),
            ];
            const plans = yield this.membershipPlanRepository.findByIds(membershipPlanIds);
            const planMap = new Map(plans.map((plan) => [plan.id, plan.name || "Unknown Plan"]));
            const enrichedTransactions = finalTransactions.map((transaction) => {
                var _a;
                return ({
                    id: transaction.id,
                    clientId: transaction.clientId,
                    userName: clientMap.get(transaction.clientId) || "Unknown User",
                    membershipPlanId: transaction.membershipPlanId,
                    planName: planMap.get(transaction.membershipPlanId) || "Unknown Plan",
                    amount: transaction.amount,
                    stripeSessionId: transaction.stripeSessionId,
                    trainerAmount: (_a = transaction.trainerAmount) !== null && _a !== void 0 ? _a : 0,
                    adminAmount: transaction.adminAmount,
                    status: transaction.status,
                    createdAt: transaction.createdAt instanceof Date
                        ? transaction.createdAt.toISOString()
                        : transaction.createdAt,
                    updatedAt: transaction.updatedAt instanceof Date
                        ? transaction.updatedAt.toISOString()
                        : transaction.updatedAt,
                    stripePaymentId: transaction.stripePaymentId,
                });
            });
            return { items: enrichedTransactions, total };
        });
    }
};
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase;
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(1, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetTransactionHistoryUseCase);
