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
exports.WorkoutVideoProgressRepository = void 0;
// D:\StriveX\api\src\interfaceAdapters\repositories\progress\workout-video-progress.repository.ts
const tsyringe_1 = require("tsyringe");
const workout_video_progress_model_1 = require("@/frameworks/database/mongoDB/models/workout-video-progress.model");
const base_repository_1 = require("../base.repository");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let WorkoutVideoProgressRepository = class WorkoutVideoProgressRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(workout_video_progress_model_1.WorkoutVideoProgressModel);
    }
    findByUserAndWorkout(userId, workoutId) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = yield this.model.findOne({ userId, workoutId }).lean();
            return progress ? this.mapToEntity(progress) : null;
        });
    }
    findUserVideoProgress(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, skip = 0, limit = 10) {
            var _a, _b;
            const [data] = yield this.model.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId) } },
                {
                    $facet: {
                        items: [
                            { $sort: { lastUpdated: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: "workouts",
                                    localField: "workoutId",
                                    foreignField: "_id",
                                    as: "workoutData",
                                },
                            },
                            { $unwind: "$workoutData" },
                            {
                                $addFields: {
                                    exerciseProgress: {
                                        $map: {
                                            input: "$exerciseProgress",
                                            as: "progress",
                                            in: {
                                                $mergeObjects: [
                                                    "$$progress",
                                                    {
                                                        exerciseDetails: {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: "$workoutData.exercises",
                                                                        as: "exercise",
                                                                        cond: {
                                                                            $eq: [
                                                                                "$$exercise._id",
                                                                                "$$progress.exerciseId",
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                                0,
                                                            ],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                $project: {
                                    workoutData: 0,
                                },
                            },
                        ],
                        total: [{ $count: "count" }],
                    },
                },
            ]);
            const total = ((_b = (_a = data === null || data === void 0 ? void 0 : data.total) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
            return { items: (data === null || data === void 0 ? void 0 : data.items) || [], total };
        });
    }
    updateVideoProgress(userId_1, workoutId_1, exerciseId_1, videoProgress_1, status_1, completedExercises_1) {
        return __awaiter(this, arguments, void 0, function* (userId, workoutId, exerciseId, videoProgress, status, completedExercises, clientTimestamp = new Date().toISOString()) {
            var _a;
            if (!mongoose_1.Types.ObjectId.isValid(exerciseId)) {
                throw new custom_error_1.CustomError("Invalid exerciseId format", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const exerciseObjectId = new mongoose_1.Types.ObjectId(exerciseId);
            const validCompletedExercises = completedExercises
                .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_1.Types.ObjectId(id));
            if (status === "Completed" &&
                !validCompletedExercises.some((id) => id.equals(exerciseObjectId))) {
                validCompletedExercises.push(exerciseObjectId);
            }
            const filter = { userId, workoutId };
            const exerciseProgressUpdate = {
                exerciseId: exerciseObjectId,
                videoProgress,
                status,
                lastUpdated: new Date(),
                clientTimestamp,
            };
            const currentProgress = yield this.model
                .findOne(Object.assign(Object.assign({}, filter), { "exerciseProgress.exerciseId": exerciseObjectId }))
                .lean();
            if (!Array.isArray(currentProgress) &&
                ((_a = currentProgress === null || currentProgress === void 0 ? void 0 : currentProgress.exerciseProgress) === null || _a === void 0 ? void 0 : _a.some((ep) => ep.exerciseId.equals(exerciseObjectId) &&
                    ep.status === "Completed" &&
                    status !== "Completed"))) {
                return this.mapToEntity(currentProgress);
            }
            let progress = yield this.model
                .findOneAndUpdate(Object.assign(Object.assign({}, filter), { "exerciseProgress.exerciseId": exerciseObjectId, $or: [
                    { "exerciseProgress.status": { $ne: "Completed" } },
                    { "exerciseProgress.clientTimestamp": { $lt: clientTimestamp } },
                ] }), {
                $set: {
                    lastUpdated: new Date(),
                    completedExercises: validCompletedExercises,
                    "exerciseProgress.$": exerciseProgressUpdate,
                },
            }, {
                new: true,
                runValidators: true,
            })
                .populate("workoutId", "title")
                .lean();
            if (!progress) {
                progress = yield this.model
                    .findOneAndUpdate(filter, {
                    $push: { exerciseProgress: exerciseProgressUpdate },
                    $set: {
                        lastUpdated: new Date(),
                        completedExercises: validCompletedExercises,
                    },
                }, {
                    new: true,
                    upsert: true,
                    runValidators: true,
                })
                    .populate("workoutId", "title")
                    .lean();
            }
            if (!progress) {
                throw new custom_error_1.CustomError("Failed to update video progress", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return this.mapToEntity(progress);
        });
    }
    mapToEntity(doc) {
        var _a;
        const { _id, __v, workoutId, userId, completedExercises, exerciseProgress } = doc, rest = __rest(doc, ["_id", "__v", "workoutId", "userId", "completedExercises", "exerciseProgress"]);
        return Object.assign(Object.assign({}, rest), { id: _id === null || _id === void 0 ? void 0 : _id.toString(), workoutId: ((_a = workoutId === null || workoutId === void 0 ? void 0 : workoutId._id) === null || _a === void 0 ? void 0 : _a.toString()) || (workoutId === null || workoutId === void 0 ? void 0 : workoutId.toString()), userId: userId === null || userId === void 0 ? void 0 : userId.toString(), completedExercises: (completedExercises === null || completedExercises === void 0 ? void 0 : completedExercises.map((id) => id.toString())) || [], exerciseProgress: (exerciseProgress === null || exerciseProgress === void 0 ? void 0 : exerciseProgress.map((ep) => {
                var _a;
                return (Object.assign(Object.assign({}, ep), { exerciseId: (_a = ep.exerciseId) === null || _a === void 0 ? void 0 : _a.toString(), lastUpdated: ep.lastUpdated || new Date(), exerciseDetails: ep.exerciseDetails || {} }));
            })) || [], status: rest.status });
    }
};
exports.WorkoutVideoProgressRepository = WorkoutVideoProgressRepository;
exports.WorkoutVideoProgressRepository = WorkoutVideoProgressRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WorkoutVideoProgressRepository);
