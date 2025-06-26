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
exports.PaymentRepository = void 0;
const tsyringe_1 = require("tsyringe");
const payment_model_1 = require("@/frameworks/database/mongoDB/models/payment.model");
const base_repository_1 = require("../base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const trainer_earnings_model_1 = require("@/frameworks/database/mongoDB/models/trainer-earnings.model");
let PaymentRepository = class PaymentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(payment_model_1.PaymentModel);
    }
    find(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $match: filter },
                {
                    $facet: {
                        items: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        total: [{ $count: "count" }],
                    },
                },
                {
                    $project: {
                        items: 1,
                        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
                    },
                },
            ];
            try {
                const result = yield this.model.aggregate(pipeline).exec();
                const { items, total } = result[0] || { items: [], total: 0 };
                const transformedItems = items.map((item) => this.mapToEntity(item));
                return { items: transformedItems, total };
            }
            catch (error) {
                console.error(`Error finding payments:`, error);
                throw error;
            }
        });
    }
    findByStripePaymentId(stripePaymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield this.model.findOne({ stripePaymentId }).lean();
                if (!payment) {
                    console.log(`No payment found for stripePaymentId: ${stripePaymentId}`);
                    return null;
                }
                return this.mapToEntity(payment);
            }
            catch (error) {
                console.error(`Error finding payment by stripePaymentId ${stripePaymentId}:`, error);
                throw error;
            }
        });
    }
    findByStripeSessionId(stripeSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield this.model.findOne({ stripeSessionId }).lean();
                if (!payment) {
                    console.log(`No payment found for stripeSessionId: ${stripeSessionId}`);
                    return null;
                }
                return this.mapToEntity(payment);
            }
            catch (error) {
                console.error(`Error finding payment by stripeSessionId ${stripeSessionId}:`, error);
                throw error;
            }
        });
    }
    updatePaymentStatus(stripePaymentId, status, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateData = { status };
                if (clientId)
                    updateData.clientId = clientId;
                const payment = yield this.model
                    .findOneAndUpdate({ stripePaymentId }, { $set: updateData }, { new: true, lean: true })
                    .exec();
                if (!payment) {
                    console.error(`Payment not found for stripePaymentId: ${stripePaymentId}`);
                    throw new custom_error_1.CustomError("Payment not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                return this.mapToEntity(payment);
            }
            catch (error) {
                console.error(`Error updating payment status for stripePaymentId ${stripePaymentId}:`, error);
                throw error;
            }
        });
    }
    findTrainerPaymentHistory(trainerId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $match: { trainerId } },
                // Join with client
                {
                    $lookup: {
                        from: "clients",
                        let: { clientId: { $toObjectId: "$clientId" } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$clientId"] },
                                },
                            },
                        ],
                        as: "client",
                    },
                },
                { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
                // Join with membership plan
                {
                    $lookup: {
                        from: "membershipplans",
                        let: { planId: { $toObjectId: "$membershipPlanId" } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$_id", "$$planId"] },
                                },
                            },
                        ],
                        as: "plan",
                    },
                },
                { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
                // Final projection for table
                {
                    $project: {
                        clientName: {
                            $cond: {
                                if: { $eq: [{ $ifNull: ["$client", null] }, null] },
                                then: "Unknown Client",
                                else: {
                                    $concat: [
                                        { $ifNull: ["$client.firstName", ""] },
                                        " ",
                                        { $ifNull: ["$client.lastName", ""] },
                                    ],
                                },
                            },
                        },
                        planTitle: { $ifNull: ["$plan.name", "Unknown Plan"] },
                        trainerAmount: "$trainerShare",
                        adminShare: "$adminShare",
                        completedAt: 1,
                    },
                },
                // Paginate and count
                {
                    $facet: {
                        items: [
                            { $sort: { completedAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        total: [{ $count: "count" }],
                    },
                },
                {
                    $project: {
                        items: 1,
                        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
                    },
                },
            ];
            const result = yield trainer_earnings_model_1.TrainerEarningsModel.aggregate(pipeline).exec();
            const { items, total } = result[0] || { items: [], total: 0 };
            return { items, total };
        });
    }
    updateMany(query, update) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.updateMany(query, { $set: update }).exec();
            return { modifiedCount: result.modifiedCount };
        });
    }
    findOne(filter, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = this.model.findOne(filter);
                if (sort) {
                    query = query.sort(sort);
                }
                const result = yield query.lean();
                return result ? this.mapToEntity(result) : null;
            }
            catch (error) {
                console.error(`Error finding payment with filter:`, filter, error);
                throw error;
            }
        });
    }
    updateById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.update(id, data);
                if (!result) {
                    throw new custom_error_1.CustomError("Payment not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
            }
            catch (error) {
                console.error(`Error updating payment with id ${id}:`, error);
                throw error;
            }
        });
    }
    updatePayment(id, updates, session) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    console.error(`[${new Date().toISOString()}] Invalid ObjectId for payment update: ${id}`);
                    throw new custom_error_1.CustomError(`Invalid payment ID: ${id}`, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updateData = Object.assign(Object.assign({}, updates), { updatedAt: new Date() });
                const options = { new: true, session, lean: true };
                const entity = yield this.model
                    .findByIdAndUpdate(id, { $set: updateData }, options)
                    .exec();
                if (!entity) {
                    console.error(`[${new Date().toISOString()}] Payment not found for update: ${id}`);
                    return null;
                }
                console.log(`[${new Date().toISOString()}] Updated payment ${id}: ${JSON.stringify(entity)}`);
                return this.mapToEntity(entity);
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error updating payment ${id}: ${error.message}`);
                throw new custom_error_1.CustomError(`Failed to update payment ${id}`, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield payment_model_1.PaymentModel.findByIdAndDelete(id);
        });
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PaymentRepository);
