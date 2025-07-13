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
exports.WorkoutProgressController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let WorkoutProgressController = class WorkoutProgressController {
    constructor(createWorkoutProgressUseCase, updateWorkoutProgressUseCase, getUserWorkoutProgressUseCase, getWorkoutProgressByUserAndWorkoutUseCase, getUserProgressMetricsUseCase) {
        this.createWorkoutProgressUseCase = createWorkoutProgressUseCase;
        this.updateWorkoutProgressUseCase = updateWorkoutProgressUseCase;
        this.getUserWorkoutProgressUseCase = getUserWorkoutProgressUseCase;
        this.getWorkoutProgressByUserAndWorkoutUseCase = getWorkoutProgressByUserAndWorkoutUseCase;
        this.getUserProgressMetricsUseCase = getUserProgressMetricsUseCase;
    }
    createProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, workoutId, categoryId, duration, date, completed, caloriesBurned, } = req.body;
                const progress = yield this.createWorkoutProgressUseCase.execute({
                    userId,
                    workoutId,
                    categoryId,
                    duration,
                    date: date ? new Date(date) : undefined,
                    caloriesBurned,
                    completed: completed || false,
                });
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    status: "success",
                    data: progress,
                    message: "Workout progress created successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    updateProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updates = req.body;
                const progress = yield this.updateWorkoutProgressUseCase.execute(id, updates);
                if (!progress) {
                    throw new custom_error_1.CustomError("Progress not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: progress,
                    message: "Workout progress updated successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getUserProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { skip = "0", limit = "10", startDate, endDate } = req.query;
                const result = yield this.getUserWorkoutProgressUseCase.execute(userId, parseInt(skip, 10), parseInt(limit, 10), startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: result,
                    message: "User workout progress retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getProgressByUserAndWorkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, workoutId } = req.params;
                const progress = yield this.getWorkoutProgressByUserAndWorkoutUseCase.execute(userId, workoutId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: progress,
                    message: progress
                        ? "Workout progress retrieved successfully"
                        : "No progress found",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getUserProgressMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { startDate, endDate } = req.query;
                const metrics = yield this.getUserProgressMetricsUseCase.execute(userId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: metrics,
                    message: "User progress metrics retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.WorkoutProgressController = WorkoutProgressController;
exports.WorkoutProgressController = WorkoutProgressController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateWorkoutProgressUseCase")),
    __param(1, (0, tsyringe_1.inject)("IUpdateWorkoutProgressUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetUserWorkoutProgressUseCase")),
    __param(3, (0, tsyringe_1.inject)("IGetWorkoutProgressByUserAndWorkoutUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetUserProgressMetricsUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkoutProgressController);
