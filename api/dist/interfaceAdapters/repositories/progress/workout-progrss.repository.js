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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutProgressRepository = void 0;
const tsyringe_1 = require("tsyringe");
const workout_progress_model_1 = require("@/frameworks/database/mongoDB/models/workout-progress.model");
const base_repository_1 = require("../base.repository");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let WorkoutProgressRepository = class WorkoutProgressRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(workout_progress_model_1.WorkoutProgressModel);
    }
    createProgress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = yield this.model.create(data);
            return this.mapToEntity(entity.toObject());
        });
    }
    updateProgress(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = yield this.model
                .findByIdAndUpdate(id, { $set: updates }, { new: true })
                .lean();
            return progress ? this.mapToEntity(progress) : null;
        });
    }
    findByUserAndWorkout(userId, workoutId) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = yield this.model.findOne({ userId, workoutId }).lean();
            return progress ? this.mapToEntity(progress) : null;
        });
    }
    findUserProgress(userId, skip, limit, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { userId };
            if (startDate || endDate) {
                filter.date = {};
                if (startDate)
                    filter.date.$gte = startDate;
                if (endDate)
                    filter.date.$lte = endDate;
            }
            const [items, total] = yield Promise.all([
                this.model.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
                this.model.countDocuments(filter),
            ]);
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return { items: transformedItems, total };
        });
    }
    getUserProgressMetrics(userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const fullPipeline = [
                {
                    $match: {
                        _id: new mongoose_1.Types.ObjectId(userId),
                    },
                },
                {
                    $project: {
                        _id: 1,
                        weight: 1,
                        height: 1,
                        subscriptionEndDate: 1,
                    },
                },
                {
                    $lookup: {
                        from: "workoutprogresses",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: Object.assign(Object.assign({ $expr: { $eq: ["$userId", "$$userId"] } }, (startDate && { date: { $gte: startDate } })), (endDate && { date: { $lte: endDate } })),
                            },
                            {
                                $sort: { date: -1 },
                            },
                        ],
                        as: "workoutProgress",
                    },
                },
                {
                    $lookup: {
                        from: "clientprogresshistories",
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: Object.assign(Object.assign({ $expr: { $eq: ["$userId", "$$userId"] } }, (startDate && { date: { $gte: startDate } })), (endDate && { date: { $lte: endDate } })),
                            },
                            {
                                $sort: { date: -1 },
                            },
                        ],
                        as: "progressHistory",
                    },
                },
                {
                    $lookup: {
                        from: "workoutvideoprogresses",
                        let: { userId: "$_id", workoutIds: "$workoutProgress.workoutId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$userId", "$$userId"] },
                                            { $in: ["$workoutId", "$$workoutIds"] },
                                        ],
                                    },
                                },
                            },
                            {
                                $project: {
                                    userId: 1,
                                    workoutId: 1,
                                    exerciseProgress: 1,
                                    completedExercises: 1,
                                    lastUpdated: 1,
                                },
                            },
                        ],
                        as: "videoProgress",
                    },
                },
                {
                    $lookup: {
                        from: "workouts",
                        let: { workoutIds: "$workoutProgress.workoutId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $in: ["$_id", "$$workoutIds"] },
                                },
                            },
                            {
                                $project: {
                                    title: 1,
                                    exercises: 1,
                                },
                            },
                        ],
                        as: "workouts",
                    },
                },
                {
                    $addFields: {
                        bmi: {
                            $cond: {
                                if: {
                                    $and: [{ $gt: ["$weight", 0] }, { $gt: ["$height", 0] }],
                                },
                                then: {
                                    $divide: [
                                        "$weight",
                                        {
                                            $pow: [{ $divide: ["$height", 100] }, 2],
                                        },
                                    ],
                                },
                                else: null,
                            },
                        },
                        weightHistory: {
                            $filter: {
                                input: "$progressHistory",
                                as: "item",
                                cond: { $ne: ["$$item.weight", null] },
                            },
                        },
                        heightHistory: {
                            $filter: {
                                input: "$progressHistory",
                                as: "item",
                                cond: { $ne: ["$$item.height", null] },
                            },
                        },
                        waterIntakeLogs: {
                            $filter: {
                                input: "$progressHistory",
                                as: "item",
                                cond: { $ne: ["$$item.waterIntake", null] },
                            },
                        },
                        totalWaterIntake: {
                            $sum: "$progressHistory.waterIntake",
                        },
                        remainingSubscriptionMs: {
                            $cond: {
                                if: { $gt: ["$subscriptionEndDate", now] },
                                then: { $subtract: ["$subscriptionEndDate", now] },
                                else: 0,
                            },
                        },
                    },
                },
                {
                    $project: {
                        workoutProgress: {
                            $map: {
                                input: "$workoutProgress",
                                as: "progress",
                                in: {
                                    id: "$$progress._id",
                                    userId: "$$progress.userId",
                                    workoutId: "$$progress.workoutId",
                                    date: "$$progress.date",
                                    duration: "$$progress.duration",
                                    caloriesBurned: "$$progress.caloriesBurned",
                                    completed: "$$progress.completed",
                                    createdAt: "$$progress.createdAt",
                                    updatedAt: "$$progress.updatedAt",
                                },
                            },
                        },
                        bmi: 1,
                        weightHistory: {
                            $map: {
                                input: "$weightHistory",
                                as: "item",
                                in: {
                                    weight: "$$item.weight",
                                    date: "$$item.date",
                                },
                            },
                        },
                        heightHistory: {
                            $map: {
                                input: "$heightHistory",
                                as: "item",
                                in: {
                                    height: "$$item.height",
                                    date: "$$item.date",
                                },
                            },
                        },
                        waterIntakeLogs: {
                            $map: {
                                input: "$waterIntakeLogs",
                                as: "item",
                                in: {
                                    actual: "$$item.waterIntake",
                                    target: "$$item.waterIntakeTarget",
                                    date: "$$item.date",
                                },
                            },
                        },
                        totalWaterIntake: 1,
                        videoProgress: {
                            $map: {
                                input: "$videoProgress",
                                as: "vp",
                                in: {
                                    id: "$$vp._id",
                                    userId: "$$vp.userId",
                                    workoutId: "$$vp.workoutId",
                                    exerciseProgress: "$$vp.exerciseProgress",
                                    completedExercises: "$$vp.completedExercises",
                                    lastUpdated: "$$vp.lastUpdated",
                                },
                            },
                        },
                        workouts: {
                            $map: {
                                input: "$workouts",
                                as: "w",
                                in: {
                                    id: "$$w._id",
                                    title: "$$w.title",
                                    exercises: "$$w.exercises",
                                },
                            },
                        },
                        subscriptionEndDate: 1,
                        remainingSubscriptionMs: 1,
                    },
                },
            ];
            const fullResult = yield this.model.db
                .collection("clients")
                .aggregate(fullPipeline)
                .toArray();
            console.log("FULL RESULT", JSON.stringify(fullResult, null, 2));
            if (!fullResult.length) {
                throw new custom_error_1.CustomError("No client found for user", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const { workoutProgress, bmi, weightHistory, heightHistory, waterIntakeLogs, totalWaterIntake, videoProgress, workouts, } = fullResult[0];
            return {
                workoutProgress: workoutProgress.map((item) => (Object.assign(Object.assign({}, item), { id: item.id.toString(), workoutId: item.workoutId.toString() }))),
                bmi,
                weightHistory,
                heightHistory,
                waterIntakeLogs,
                totalWaterIntake,
                subscriptionEndDate: fullResult[0].subscriptionEndDate,
                videoProgress: videoProgress.map((item) => (Object.assign(Object.assign({}, item), { id: item.id.toString(), userId: item.userId.toString(), workoutId: item.workoutId.toString() }))),
                workouts: workouts.map((item) => (Object.assign(Object.assign({}, item), { id: item.id.toString() }))),
            };
        });
    }
    mapToEntity(doc) {
        var _a;
        const { _id, __v, workoutId } = doc, rest = __rest(doc, ["_id", "__v", "workoutId"]);
        return Object.assign(Object.assign({}, rest), { id: _id === null || _id === void 0 ? void 0 : _id.toString(), workoutId: ((_a = workoutId === null || workoutId === void 0 ? void 0 : workoutId._id) === null || _a === void 0 ? void 0 : _a.toString()) || workoutId });
    }
};
exports.WorkoutProgressRepository = WorkoutProgressRepository;
exports.WorkoutProgressRepository = WorkoutProgressRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WorkoutProgressRepository);
