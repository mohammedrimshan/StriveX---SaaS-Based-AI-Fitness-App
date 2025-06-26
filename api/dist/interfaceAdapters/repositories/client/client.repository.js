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
exports.ClientRepository = void 0;
const tsyringe_1 = require("tsyringe");
const client_model_1 = require("@/frameworks/database/mongoDB/models/client.model");
const base_repository_1 = require("../base.repository");
const constants_1 = require("@/shared/constants");
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
let ClientRepository = class ClientRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_model_1.ClientModel);
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndMap({ email });
        });
    }
    updateByEmail(email, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ email }, updates);
        });
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId || typeof clientId !== "string") {
                throw new Error("Invalid clientId");
            }
            const client = yield this.model.findOne({ clientId }).lean();
            return client ? this.mapToEntity(client) : null;
        });
    }
    findByClientNewId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId || typeof clientId !== "string") {
                throw new Error("Invalid clientId");
            }
            try {
                const query = (0, mongoose_2.isValidObjectId)(clientId)
                    ? { $or: [{ _id: clientId }, { clientId }] }
                    : { clientId };
                const client = yield this.model.findOne(query).lean();
                return client ? this.mapToEntity(client) : null;
            }
            catch (error) {
                console.error(`Error in findByClientNewId for clientId: ${clientId}`, error);
                return null;
            }
        });
    }
    updateByClientId(clientId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ clientId }, updates);
        });
    }
    updatePremiumStatus(clientId, isPremium) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.findOneAndUpdateAndMap({ clientId }, { isPremium });
            if (!updated)
                throw new Error("Client not found");
            return updated;
        });
    }
    findByIdAndUpdate(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.model
                .findByIdAndUpdate(id, { $set: updateData }, { new: true })
                .lean();
            return client ? this.mapToEntity(client) : null;
        });
    }
    findByIdAndUpdatePassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndUpdate(id, { password });
        });
    }
    findTrainerRequests(trainerId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        selectedTrainerId: trainerId,
                        selectStatus: constants_1.TrainerSelectionStatus.PENDING,
                    },
                },
                {
                    $lookup: {
                        from: "trainers",
                        localField: "selectedTrainerId",
                        foreignField: "_id",
                        as: "trainer",
                    },
                },
                {
                    $unwind: {
                        path: "$trainer",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        clientId: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        profileImage: 1,
                        fitnessGoal: 1,
                        experienceLevel: 1,
                        preferredWorkout: 1,
                        selectStatus: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        trainerName: {
                            $concat: ["$trainer.firstName", " ", "$trainer.lastName"],
                        },
                    },
                },
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
            const result = yield this.model.aggregate(pipeline).exec();
            const { items, total } = result[0] || { items: [], total: 0 };
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return { items: transformedItems, total };
        });
    }
    findByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const striveXIds = ids.filter((id) => id.includes("striveX-client"));
                const mongoIds = ids.filter((id) => (0, mongoose_2.isValidObjectId)(id));
                console.log("StriveX IDs:", striveXIds);
                console.log("MongoDB IDs:", mongoIds);
                const clients = yield this.model
                    .find({
                    $or: [{ clientId: { $in: striveXIds } }, { _id: { $in: mongoIds } }],
                })
                    .select("_id clientId firstName lastName")
                    .lean();
                return clients.map((client) => {
                    const matchedId = striveXIds.includes(client.clientId)
                        ? client.clientId
                        : client._id.toString();
                    return {
                        id: matchedId,
                        name: `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
                            "Unknown User",
                    };
                });
            }
            catch (error) {
                console.error(`Error finding clients by IDs: ${ids.join(", ")}`, error);
                throw error;
            }
        });
    }
    findAcceptedClients(trainerId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        selectedTrainerId: trainerId,
                        selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                    },
                },
                {
                    $project: {
                        clientId: 1,
                        firstName: 1,
                        lastName: 1,
                        profileImage: 1,
                        email: 1,
                        phoneNumber: 1,
                        fitnessGoal: 1,
                        experienceLevel: 1,
                        preferredWorkout: 1,
                        selectStatus: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        height: 1,
                        weight: 1,
                        status: 1,
                        googleId: 1,
                        activityLevel: 1,
                        healthConditions: 1,
                        waterIntake: 1,
                        dietPreference: 1,
                        isPremium: 1,
                        sleepFrom: 1,
                        wakeUpAt: 1,
                        skillsToGain: 1,
                        selectionMode: 1,
                        matchedTrainers: 1,
                    },
                },
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
            const result = yield this.model.aggregate(pipeline).exec();
            const { items, total } = result[0] || { items: [], total: 0 };
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return { items: transformedItems, total };
        });
    }
    findUserSubscriptions(page, limit, search, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const match = { isPremium: true };
            if (search) {
                match["$or"] = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            const pipeline = [
                { $match: match },
                {
                    $lookup: {
                        from: "payments",
                        let: { clientId: "$clientId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$clientId", "$$clientId"] },
                                    status: constants_1.PaymentStatus.COMPLETED,
                                },
                            },
                            { $sort: { createdAt: -1 } },
                            { $limit: 1 },
                        ],
                        as: "latestPayment",
                    },
                },
                {
                    $unwind: {
                        path: "$latestPayment",
                        preserveNullAndEmptyArrays: true,
                    },
                },
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
                {
                    $unwind: {
                        path: "$plan",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        clientId: 1,
                        clientName: {
                            $concat: [
                                { $ifNull: ["$firstName", ""] },
                                " ",
                                { $ifNull: ["$lastName", ""] },
                            ],
                        },
                        profileImage: 1,
                        subscriptionStartDate: 1,
                        subscriptionEndDate: 1,
                        isExpired: {
                            $cond: {
                                if: {
                                    $or: [
                                        { $eq: ["$subscriptionEndDate", null] },
                                        { $lt: [{ $toDate: "$subscriptionEndDate" }, new Date()] },
                                    ],
                                },
                                then: true,
                                else: false,
                            },
                        },
                        daysUntilExpiration: {
                            $cond: {
                                if: { $eq: ["$subscriptionEndDate", null] },
                                then: 0,
                                else: {
                                    $divide: [
                                        {
                                            $subtract: [
                                                { $toDate: "$subscriptionEndDate" },
                                                new Date(),
                                            ],
                                        },
                                        1000 * 60 * 60 * 24,
                                    ],
                                },
                            },
                        },
                        membershipPlanId: 1,
                        planName: { $ifNull: ["$plan.name", "Unknown Plan"] },
                        amount: "$latestPayment.price",
                        status: "$latestPayment.status",
                        remainingBalance: "$latestPayment.remainingBalance",
                    },
                },
            ];
            if (status && status !== "all") {
                pipeline.push({
                    $match: {
                        isExpired: status === "expired",
                    },
                });
            }
            pipeline.push({
                $facet: {
                    items: [
                        { $sort: { subscriptionStartDate: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    total: [{ $count: "count" }],
                },
            }, {
                $project: {
                    items: 1,
                    total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
                },
            });
            try {
                const result = yield this.model.aggregate(pipeline).exec();
                const { items, total } = result[0] || { items: [], total: 0 };
                return {
                    items: items.map((item) => ({
                        clientId: item.clientId,
                        clientName: item.clientName.trim() || "Unknown Client",
                        profileImage: item.profileImage,
                        subscriptionStartDate: item.subscriptionStartDate,
                        subscriptionEndDate: item.subscriptionEndDate,
                        isExpired: item.isExpired,
                        daysUntilExpiration: Math.round(item.daysUntilExpiration) || 0,
                        membershipPlanId: item.membershipPlanId,
                        planName: item.planName,
                        amount: item.amount,
                        status: item.status || constants_1.PaymentStatus.COMPLETED,
                        remainingBalance: item.remainingBalance || 0,
                    })),
                    total,
                };
            }
            catch (error) {
                console.error("Error fetching user subscriptions:", error);
                throw error;
            }
        });
    }
    updateBackupTrainer(clientId, backupTrainerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(clientId, backupTrainerId, status, "updateBackupTrainer");
            return this.findOneAndUpdateAndMap({ clientId }, { backupTrainerId, backupTrainerStatus: status });
        });
    }
    clearBackupTrainer(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ _id: new mongoose_1.default.Types.ObjectId(clientId) }, { backupTrainerId: null, backupTrainerStatus: null });
        });
    }
    updateBackupTrainerIfNotAssigned(clientId, trainerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield client_model_1.ClientModel.findOneAndUpdate({
                clientId,
                $or: [
                    { backupTrainerId: null },
                    { backupTrainerId: { $exists: false } },
                ],
            }, {
                backupTrainerId: trainerId,
                backupTrainerStatus: status,
            }, { new: true })
                .lean()
                .exec();
            if (!doc)
                return null;
            return this.mapToEntity(doc);
        });
    }
    findClientsBySelectedTrainerId(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_model_1.ClientModel.find({ selectedTrainerId: trainerId });
        });
    }
    findClientsByBackupTrainerId(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_model_1.ClientModel.find({ backupTrainerId: trainerId });
        });
    }
    findClientsByPreviousTrainerId(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_model_1.ClientModel.find({ previousTrainerId: trainerId });
        });
    }
};
exports.ClientRepository = ClientRepository;
exports.ClientRepository = ClientRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ClientRepository);
