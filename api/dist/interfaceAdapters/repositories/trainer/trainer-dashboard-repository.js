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
exports.TrainerDashboardRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("../base.repository");
const client_model_1 = require("@/frameworks/database/mongoDB/models/client.model");
const trainer_model_1 = require("@/frameworks/database/mongoDB/models/trainer.model");
const payment_model_1 = require("@/frameworks/database/mongoDB/models/payment.model");
const session_history_model_1 = require("@/frameworks/database/mongoDB/models/session-history.model");
const review_model_1 = require("@/frameworks/database/mongoDB/models/review.model");
const workout_model_1 = require("@/frameworks/database/mongoDB/models/workout.model");
const workout_progress_model_1 = require("@/frameworks/database/mongoDB/models/workout-progress.model");
const category_model_1 = require("@/frameworks/database/mongoDB/models/category.model");
const mongoose_1 = require("mongoose");
const slot_model_1 = require("@/frameworks/database/mongoDB/models/slot.model");
const mongoose_2 = __importDefault(require("mongoose"));
const trainer_earnings_model_1 = require("@/frameworks/database/mongoDB/models/trainer-earnings.model");
let TrainerDashboardRepository = class TrainerDashboardRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(payment_model_1.PaymentModel);
        this.clientModel = client_model_1.ClientModel;
        this.trainerModel = trainer_model_1.TrainerModel;
        this.paymentModel = payment_model_1.PaymentModel;
        this.sessionHistoryModel = session_history_model_1.SessionHistoryModel;
        this.reviewModel = review_model_1.ReviewModel;
        this.workoutModel = workout_model_1.WorkoutModel;
        this.workoutProgressModel = workout_progress_model_1.WorkoutProgressModel;
        this.categoryModel = category_model_1.CategoryModel;
        this.slotModel = slot_model_1.SlotModel;
    }
    getDashboardStats(trainerId, year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const trainerObjectId = new mongoose_1.Types.ObjectId(trainerId);
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const todayISO = now.toISOString().split("T")[0];
            const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
            const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            const [clientCount, sessionCount, earnings, avgRating, upcomingSessions] = yield Promise.all([
                this.clientModel.countDocuments({
                    selectedTrainerId: trainerId,
                    selectStatus: "accepted",
                }),
                this.sessionHistoryModel.countDocuments({
                    trainerId,
                    videoCallStatus: "ended",
                }),
                trainer_earnings_model_1.TrainerEarningsModel.aggregate([
                    {
                        $match: {
                            trainerId,
                            completedAt: { $gte: monthStart, $lte: monthEnd },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$trainerShare" },
                        },
                    },
                ]).exec(),
                this.reviewModel
                    .aggregate([
                    { $match: { trainerId } },
                    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
                ])
                    .exec(),
                this.slotModel.countDocuments({
                    trainerId: trainerObjectId,
                    status: "booked",
                    date: { $gte: todayISO },
                }),
            ]);
            return {
                totalClients: clientCount,
                totalSessions: sessionCount,
                earningsThisMonth: ((_a = earnings[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
                averageRating: ((_b = avgRating[0]) === null || _b === void 0 ? void 0 : _b.avgRating) || 0,
                upcomingSessions,
            };
        });
    }
    getUpcomingSessions(trainerId_1) {
        return __awaiter(this, arguments, void 0, function* (trainerId, limit = 5) {
            const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const todayString = now.toISOString().split("T")[0];
            const trainerObjectId = new mongoose_1.Types.ObjectId(trainerId);
            console.log("Filtering for date >= ", todayString);
            console.log("Trainer ObjectId: ", trainerObjectId);
            const result = yield this.slotModel
                .aggregate([
                {
                    $match: {
                        trainerId: trainerObjectId,
                        status: "booked",
                        date: { $gte: todayString },
                    },
                },
                {
                    $addFields: {
                        clientObjectId: { $toObjectId: "$clientId" },
                    },
                },
                {
                    $lookup: {
                        from: "clients",
                        localField: "clientObjectId",
                        foreignField: "_id",
                        as: "client",
                    },
                },
                { $unwind: "$client" },
                {
                    $project: {
                        date: 1,
                        startTime: 1,
                        endTime: 1,
                        clientName: {
                            $concat: ["$client.firstName", " ", "$client.lastName"],
                        },
                        clientId: "$client._id",
                        profileImage: "$client.profileImage",
                    },
                },
                { $sort: { date: 1, startTime: 1 } },
                { $limit: safeLimit },
            ])
                .exec();
            console.log("Aggregation result:", result);
            return result.map((item) => {
                var _a;
                return ({
                    id: item._id.toString(),
                    date: item.date,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    clientName: item.clientName,
                    clientId: item.clientId.toString(),
                    profileImage: (_a = item.profileImage) !== null && _a !== void 0 ? _a : null,
                });
            });
        });
    }
    getWeeklySessionStats(trainerId, year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const startDateString = startDate.toISOString().split("T")[0];
            const endDateString = endDate.toISOString().split("T")[0];
            const result = yield this.sessionHistoryModel
                .aggregate([
                {
                    $match: {
                        trainerId: new mongoose_2.default.Types.ObjectId(trainerId),
                        status: "booked",
                        date: { $gte: startDateString, $lte: endDateString },
                    },
                },
                {
                    $lookup: {
                        from: "workoutprogresses",
                        localField: "_id",
                        foreignField: "sessionId",
                        as: "progress",
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "progress.categoryId",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $group: {
                        _id: {
                            week: {
                                $week: {
                                    $dateFromString: { dateString: "$date", format: "%Y-%m-%d" },
                                },
                            },
                            category: { $arrayElemAt: ["$category.title", 0] },
                        },
                        totalSessions: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        week: "$_id.week",
                        category: "$_id.category",
                        totalSessions: 1,
                        _id: 0,
                    },
                },
                { $sort: { week: 1 } },
            ])
                .exec();
            return result;
        });
    }
    getClientFeedback(trainerId_1) {
        return __awaiter(this, arguments, void 0, function* (trainerId, limit = 5) {
            const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 5;
            const result = yield this.reviewModel
                .aggregate([
                { $match: { trainerId: trainerId.toString() } },
                {
                    $project: {
                        rating: 1,
                        comment: 1,
                        createdAt: 1,
                        clientName: 1,
                        clientProfileImage: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: safeLimit },
            ])
                .exec();
            return result.map((item) => ({
                id: item._id.toString(),
                rating: item.rating,
                comment: item.comment,
                clientName: item.clientName,
                clientProfileImage: item.clientProfileImage,
                createdAt: item.createdAt,
            }));
        });
    }
    getEarningsReport(trainerId, year, month) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
            const result = yield trainer_earnings_model_1.TrainerEarningsModel.aggregate([
                {
                    $match: {
                        trainerId,
                        completedAt: { $gte: monthStart, $lte: monthEnd },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: "$trainerShare" },
                        platformCommission: { $sum: "$adminShare" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalEarnings: 1,
                        platformCommission: 1,
                    },
                },
            ]).exec();
            return {
                totalEarnings: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) || 0,
                platformCommission: ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.platformCommission) || 0,
            };
        });
    }
    getClientProgress(trainerId_1) {
        return __awaiter(this, arguments, void 0, function* (trainerId, limit = 3) {
            const result = yield this.workoutProgressModel
                .aggregate([
                {
                    $lookup: {
                        from: "clients",
                        localField: "userId",
                        foreignField: "_id",
                        as: "client",
                    },
                },
                { $unwind: "$client" },
                { $match: { "client.selectedTrainerId": trainerId } },
                {
                    $group: {
                        _id: "$userId",
                        clientName: {
                            $first: {
                                $concat: ["$client.firstName", " ", "$client.lastName"],
                            },
                        },
                        profileImage: { $first: "$client.profileImage" },
                        totalSessions: { $sum: 1 },
                        completedSessions: { $sum: { $cond: ["$completed", 1, 0] } },
                    },
                },
                {
                    $project: {
                        clientId: "$_id",
                        clientName: 1,
                        profileImage: 1,
                        consistency: { $divide: ["$completedSessions", "$totalSessions"] },
                        _id: 0,
                    },
                },
                { $sort: { consistency: -1 } },
                { $limit: limit * 2 },
            ])
                .exec();
            return [
                ...result.slice(0, limit).map((item) => (Object.assign(Object.assign({}, item), { type: "most" }))),
                ...result
                    .slice(-limit)
                    .filter((item) => !result
                    .slice(0, limit)
                    .some((topItem) => topItem.clientId.toString() === item.clientId.toString()))
                    .map((item) => (Object.assign(Object.assign({}, item), { type: "least" }))),
            ];
        });
    }
    getSessionHistory(trainerId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = {
                trainerId: new mongoose_2.default.Types.ObjectId(trainerId),
            };
            if (filters.date)
                match.date = filters.date;
            if (filters.clientId)
                match.clientId = new mongoose_2.default.Types.ObjectId(filters.clientId);
            if (filters.status)
                match.status = filters.status;
            const result = yield this.sessionHistoryModel
                .aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: "clients",
                        localField: "clientId",
                        foreignField: "_id",
                        as: "client",
                    },
                },
                { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        date: 1,
                        startTime: 1,
                        endTime: 1,
                        status: 1,
                        clientName: {
                            $concat: ["$client.firstName", " ", "$client.lastName"],
                        },
                        clientId: "$client._id",
                    },
                },
                { $sort: { date: -1 } },
            ])
                .exec();
            return result.map((item) => {
                var _a;
                return ({
                    id: item._id.toString(),
                    date: item.date,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    status: item.status,
                    clientName: item.clientName || "N/A",
                    clientId: (_a = item.clientId) === null || _a === void 0 ? void 0 : _a.toString(),
                });
            });
        });
    }
};
exports.TrainerDashboardRepository = TrainerDashboardRepository;
exports.TrainerDashboardRepository = TrainerDashboardRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TrainerDashboardRepository);
