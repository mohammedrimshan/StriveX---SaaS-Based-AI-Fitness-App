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
exports.WorkoutVideoProgressController = void 0;
const tsyringe_1 = require("tsyringe");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const constants_1 = require("@/shared/constants");
let WorkoutVideoProgressController = class WorkoutVideoProgressController {
    constructor(updateVideoProgressUseCase, getUserVideoProgressUseCase, getVideoProgressByUserAndWorkoutUseCase) {
        this.updateVideoProgressUseCase = updateVideoProgressUseCase;
        this.getUserVideoProgressUseCase = getUserVideoProgressUseCase;
        this.getVideoProgressByUserAndWorkoutUseCase = getVideoProgressByUserAndWorkoutUseCase;
    }
    updateVideoProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, workoutId, videoProgress, exerciseId, status, completedExercises } = req.body;
                const progress = yield this.updateVideoProgressUseCase.execute(userId, workoutId, videoProgress, status, completedExercises, exerciseId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: progress,
                    message: "Video progress updated successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getUserVideoProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { skip = "0", limit = "10" } = req.query;
                const result = yield this.getUserVideoProgressUseCase.execute(userId, parseInt(skip, 10), parseInt(limit, 10));
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: result,
                    message: "User video progress retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getVideoProgressByUserAndWorkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, workoutId } = req.params;
                const progress = yield this.getVideoProgressByUserAndWorkoutUseCase.execute(userId, workoutId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: progress,
                    message: progress ? "Video progress retrieved successfully" : "No progress found",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.WorkoutVideoProgressController = WorkoutVideoProgressController;
exports.WorkoutVideoProgressController = WorkoutVideoProgressController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IUpdateVideoProgressUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetUserVideoProgressUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetVideoProgressByUserAndWorkoutUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object])
], WorkoutVideoProgressController);
