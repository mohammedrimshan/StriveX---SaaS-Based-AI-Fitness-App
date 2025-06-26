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
exports.AdminDashboardRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("../base.repository");
const client_model_1 = require("@/frameworks/database/mongoDB/models/client.model");
const trainer_model_1 = require("@/frameworks/database/mongoDB/models/trainer.model");
const payment_model_1 = require("@/frameworks/database/mongoDB/models/payment.model");
const category_model_1 = require("@/frameworks/database/mongoDB/models/category.model");
const slot_model_1 = require("@/frameworks/database/mongoDB/models/slot.model");
const session_history_model_1 = require("@/frameworks/database/mongoDB/models/session-history.model");
const workout_model_1 = require("@/frameworks/database/mongoDB/models/workout.model");
const workout_progress_model_1 = require("@/frameworks/database/mongoDB/models/workout-progress.model");
let AdminDashboardRepository = class AdminDashboardRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(payment_model_1.PaymentModel);
        this.clientModel = client_model_1.ClientModel;
        this.trainerModel = trainer_model_1.TrainerModel;
        this.categoryModel = category_model_1.CategoryModel;
        this.slotModel = slot_model_1.SlotModel;
        this.sessionHistoryModel = session_history_model_1.SessionHistoryModel;
        this.workoutModel = workout_model_1.WorkoutModel;
        this.workoutProgressModel = workout_progress_model_1.WorkoutProgressModel;
    }
    getDashboardStats(year) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const [paymentResult, userCount, trainerCount, categoryCount, sessionCount,] = yield Promise.all([
                this.model
                    .aggregate([
                    { $match: { status: "completed" } },
                    {
                        $facet: {
                            totalRevenue: [
                                { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
                            ],
                            monthlyFinancials: [
                                {
                                    $match: {
                                        createdAt: {
                                            $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
                                            $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
                                        },
                                    },
                                },
                                {
                                    $group: {
                                        _id: {
                                            $dateToString: {
                                                format: "%Y-%m",
                                                date: "$createdAt",
                                                timezone: "Asia/Kolkata",
                                            },
                                        },
                                        totalIncome: { $sum: "$amount" },
                                        totalTrainerEarnings: { $sum: "$trainerAmount" },
                                    },
                                },
                                {
                                    $project: {
                                        month: "$_id",
                                        totalIncome: 1,
                                        profit: {
                                            $subtract: ["$totalIncome", "$totalTrainerEarnings"],
                                        },
                                        _id: 0,
                                    },
                                },
                                { $sort: { month: 1 } },
                            ],
                        },
                    },
                ])
                    .exec(),
                this.clientModel.countDocuments({ role: "client" }),
                this.trainerModel.countDocuments({ approvalStatus: "approved" }),
                this.categoryModel.countDocuments({ status: true }),
                this.slotModel.countDocuments({ isBooked: true, status: "booked" }),
            ]);
            return {
                totalRevenue: ((_b = (_a = paymentResult[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue[0]) === null || _b === void 0 ? void 0 : _b.totalRevenue) || 0,
                totalUsers: userCount,
                totalTrainers: trainerCount,
                totalCategories: categoryCount,
                activeSessions: sessionCount,
                monthlyFinancials: ((_c = paymentResult[0]) === null || _c === void 0 ? void 0 : _c.monthlyFinancials) || [],
            };
        });
    }
    getTopPerformingTrainers() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const result = yield this.trainerModel
                .aggregate([
                { $match: { approvalStatus: "approved" } },
                {
                    $lookup: {
                        from: "sessionhistories",
                        localField: "_id",
                        foreignField: "trainerId",
                        as: "sessions",
                    },
                },
                {
                    $project: {
                        name: { $concat: ["$firstName", " ", "$lastName"] },
                        skills: 1,
                        totalSessions: { $size: "$sessions" },
                        totalClients: {
                            $size: {
                                $setUnion: {
                                    $map: {
                                        input: "$sessions",
                                        as: "session",
                                        in: "$$session.clientId",
                                    },
                                },
                            },
                        },
                        _id: 1,
                    },
                },
                { $sort: { totalClients: -1 } },
                { $limit: limit },
            ])
                .exec();
            return result.map((item) => ({
                id: item._id.toString(),
                name: item.name,
                skills: item.skills || [],
                totalClients: item.totalClients,
                totalSessions: item.totalSessions,
            }));
        });
    }
    getPopularWorkouts() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            // Current date/time in IST timezone
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            // Define start and end of current month
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            // Define start and end of last month
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            const result = yield this.workoutModel
                .aggregate([
                {
                    $lookup: {
                        from: "workoutprogresses",
                        localField: "_id",
                        foreignField: "workoutId",
                        as: "progress",
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
                },
                {
                    $addFields: {
                        enrolledClients: { $size: { $setUnion: ["$progress.userId"] } },
                        sessionsThisMonth: {
                            $size: {
                                $filter: {
                                    input: "$progress",
                                    as: "p",
                                    cond: {
                                        $and: [
                                            { $gte: ["$$p.date", currentMonthStart] },
                                            { $lte: ["$$p.date", currentMonthEnd] },
                                            { $eq: ["$$p.completed", true] },
                                        ],
                                    },
                                },
                            },
                        },
                        sessionsLastMonth: {
                            $size: {
                                $filter: {
                                    input: "$progress",
                                    as: "p",
                                    cond: {
                                        $and: [
                                            { $gte: ["$$p.date", lastMonthStart] },
                                            { $lte: ["$$p.date", lastMonthEnd] },
                                            { $eq: ["$$p.completed", true] },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        growthPercentage: {
                            $cond: {
                                if: { $eq: ["$sessionsLastMonth", 0] },
                                then: 0,
                                else: {
                                    $multiply: [
                                        {
                                            $divide: [
                                                {
                                                    $subtract: [
                                                        "$sessionsThisMonth",
                                                        "$sessionsLastMonth",
                                                    ],
                                                },
                                                "$sessionsLastMonth",
                                            ],
                                        },
                                        100,
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        name: "$title",
                        category: { $ifNull: ["$category.title", "Uncategorized"] },
                        enrolledClients: 1,
                        growthPercentage: 1,
                    },
                },
                { $sort: { enrolledClients: -1 } },
                { $limit: limit },
            ])
                .exec();
            return result.map((item) => ({
                id: item._id.toString(),
                name: item.name,
                category: item.category,
                enrolledClients: item.enrolledClients,
                growthPercentage: item.growthPercentage,
            }));
        });
    }
    getUserAndSessionData(year_1) {
        return __awaiter(this, arguments, void 0, function* (year, type = "daily") {
            const sessionFormat = type === "daily" ? "%Y-%m-%d" : "%Y-%U";
            const startOfYear = new Date(`${year}-01-01T00:00:00.000+05:30`);
            const endOfYear = new Date(`${year}-12-31T23:59:59.999+05:30`);
            const [signupResult, sessionResult] = yield Promise.all([
                this.clientModel
                    .aggregate([
                    {
                        $match: {
                            role: "client",
                            createdAt: { $gte: startOfYear, $lte: endOfYear },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: "%Y-%m",
                                    date: "$createdAt",
                                    timezone: "Asia/Kolkata",
                                },
                            },
                            totalSignups: { $sum: 1 },
                        },
                    },
                    { $project: { month: "$_id", totalSignups: 1, _id: 0 } },
                    { $sort: { month: 1 } },
                ])
                    .exec(),
                this.sessionHistoryModel
                    .aggregate([
                    {
                        $match: {
                            status: "booked",
                            createdAt: { $gte: startOfYear, $lte: endOfYear },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: sessionFormat,
                                    date: "$createdAt",
                                    timezone: "Asia/Kolkata",
                                },
                            },
                            totalSessions: { $sum: 1 },
                        },
                    },
                    { $project: { period: "$_id", totalSessions: 1, _id: 0 } },
                    { $sort: { period: 1 } },
                ])
                    .exec(),
            ]);
            return {
                monthlySignups: signupResult,
                sessionOverview: sessionResult,
            };
        });
    }
    getRevenueReport(year) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model
                .aggregate([
                {
                    $match: {
                        status: "completed",
                        createdAt: {
                            $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
                            $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m",
                                date: "$createdAt",
                                timezone: "Asia/Kolkata",
                            },
                        },
                        totalRevenue: { $sum: "$amount" },
                        totalTrainerEarnings: { $sum: "$trainerAmount" },
                        totalProfit: { $sum: { $subtract: ["$amount", "$trainerAmount"] } },
                    },
                },
                {
                    $project: {
                        month: "$_id",
                        totalRevenue: 1,
                        totalTrainerEarnings: 1,
                        totalProfit: 1,
                        _id: 0,
                    },
                },
                { $sort: { month: 1 } },
            ])
                .exec();
            return result;
        });
    }
    getSessionReport(year) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.sessionHistoryModel
                .aggregate([
                {
                    $match: {
                        status: "booked",
                        createdAt: {
                            $gte: new Date(`${year}-01-01T00:00:00.000+05:30`),
                            $lte: new Date(`${year}-12-31T23:59:59.999+05:30`),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                                timezone: "Asia/Kolkata",
                            },
                        },
                        totalSessions: { $sum: 1 },
                        uniqueClients: { $addToSet: "$clientId" },
                    },
                },
                {
                    $project: {
                        date: "$_id",
                        totalSessions: 1,
                        uniqueClientsCount: { $size: "$uniqueClients" },
                        _id: 0,
                    },
                },
                { $sort: { date: 1 } },
            ])
                .exec();
            return result;
        });
    }
};
exports.AdminDashboardRepository = AdminDashboardRepository;
exports.AdminDashboardRepository = AdminDashboardRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], AdminDashboardRepository);
