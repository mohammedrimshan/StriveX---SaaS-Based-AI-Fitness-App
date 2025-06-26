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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientWalletRepository = void 0;
const tsyringe_1 = require("tsyringe");
const client_wallet_model_1 = require("@/frameworks/database/mongoDB/models/client-wallet.model");
const base_repository_1 = require("../base.repository");
const constants_1 = require("@/shared/constants");
const wallet_transaction_model_1 = require("@/frameworks/database/mongoDB/models/wallet-transaction.model");
let ClientWalletRepository = class ClientWalletRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_wallet_model_1.ClientWalletModel);
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndMap({ clientId });
        });
    }
    updateBalance(clientId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.findByClientId(clientId);
            console.log(wallet, "wallet from repo");
            // Calculate new balance: if wallet doesn't exist, start from 0
            const newBalance = ((wallet === null || wallet === void 0 ? void 0 : wallet.balance) || 0) + amount;
            console.log(newBalance, "newBalance");
            // Update wallet balance or create new wallet if none exists
            return this.findOneAndUpdateAndMap({ clientId }, // filter
            { balance: newBalance }, // update
            { upsert: true, new: true } // options: create if not found, return updated doc
            );
        });
    }
    getWalletTransactionSummary(clientId, year, month, skip, limit, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId || typeof clientId !== "string") {
                throw new Error("Invalid clientId");
            }
            if (month < 1 || month > 12) {
                throw new Error("Invalid month");
            }
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            // ✅ Apply correct filtering by clientId and date range
            const matchStage = {
                clientId,
                createdAt: { $gte: startDate, $lte: endDate },
            };
            if (type) {
                matchStage.type = type;
            }
            const transactionPipeline = [
                {
                    $match: matchStage,
                },
                {
                    $facet: {
                        monthlyCount: [
                            { $count: "count" }, // Already filtered by month from matchStage
                        ],
                        totalCount: [
                            { $count: "count" }, // Total count for the month
                        ],
                        totalAmount: [
                            {
                                $group: {
                                    _id: null,
                                    total: {
                                        $sum: {
                                            $cond: [
                                                { $eq: ["$type", constants_1.WalletTransactionType.WITHDRAWAL] },
                                                { $multiply: ["$amount", -1] },
                                                "$amount",
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                        transactions: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    id: "$_id",
                                    clientId: 1,
                                    amount: { $round: ["$amount", 2] },
                                    type: 1,
                                    reason: 1,
                                    createdAt: 1,
                                },
                            },
                        ],
                        transactionTotal: [{ $count: "count" }],
                    },
                },
                {
                    $project: {
                        monthlyTransactionCount: {
                            $ifNull: [{ $arrayElemAt: ["$monthlyCount.count", 0] }, 0],
                        },
                        totalTransactionCount: {
                            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
                        },
                        totalTransactionAmount: {
                            $cond: {
                                if: { $lt: [{ $arrayElemAt: ["$totalAmount.total", 0] }, 0] },
                                then: 0,
                                else: {
                                    $round: [{ $arrayElemAt: ["$totalAmount.total", 0] }, 2],
                                },
                            },
                        },
                        transactions: "$transactions",
                        transactionTotal: {
                            $ifNull: [{ $arrayElemAt: ["$transactionTotal.count", 0] }, 0],
                        },
                    },
                },
            ];
            const transactionResult = yield wallet_transaction_model_1.WalletTransactionModel.aggregate(transactionPipeline).exec();
            const { monthlyTransactionCount = 0, totalTransactionCount = 0, totalTransactionAmount = 0, transactions = [], transactionTotal = 0, } = transactionResult[0] || {};
            return {
                monthlyTransactionCount,
                totalTransactionCount,
                totalTransactionAmount,
                transactions: transactions.map((item) => {
                    var _a, _b;
                    return (Object.assign(Object.assign({}, item), { id: ((_b = (_a = item._id) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) || item.id }));
                }),
                transactionTotal,
            };
        });
    }
};
exports.ClientWalletRepository = ClientWalletRepository;
exports.ClientWalletRepository = ClientWalletRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ClientWalletRepository);
