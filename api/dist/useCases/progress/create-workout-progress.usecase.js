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
exports.CreateWorkoutProgressUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const workout_model_1 = require("@/frameworks/database/mongoDB/models/workout.model");
const socket_service_1 = require("@/interfaceAdapters/services/socket.service");
let CreateWorkoutProgressUseCase = class CreateWorkoutProgressUseCase {
    constructor(workoutProgressRepository, clientRepository, socketService) {
        this.workoutProgressRepository = workoutProgressRepository;
        this.clientRepository = clientRepository;
        this.socketService = socketService;
    }
    execute(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.userId || !data.workoutId) {
                throw new custom_error_1.CustomError("Missing required fields: userId, workoutId", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const client = yield this.clientRepository.findById(data.userId);
            if (!client) {
                throw new custom_error_1.CustomError("User not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const workout = yield workout_model_1.WorkoutModel.findById(data.workoutId)
                .populate("category")
                .lean();
            if (!workout) {
                throw new custom_error_1.CustomError("Workout not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            let duration = data.duration;
            let caloriesBurned = data.caloriesBurned;
            const intensityMap = {
                Beginner: 0.8,
                Intermediate: 1.0,
                Advanced: 1.2,
            };
            if (!duration || duration <= 0 || !caloriesBurned) {
                duration =
                    duration || (workout.duration ? Math.round(workout.duration / 60) : 30);
                if (!caloriesBurned && client.weight && workout.category) {
                    const category = workout.category;
                    if (!category || !category.metValue) {
                        throw new custom_error_1.CustomError("Category or MET value not found", constants_1.HTTP_STATUS.NOT_FOUND);
                    }
                    const intensity = intensityMap[workout.difficulty] || 1;
                    caloriesBurned = Math.round(category.metValue * client.weight * (duration / 60) * intensity);
                }
                else if (!caloriesBurned) {
                    caloriesBurned = 0;
                }
            }
            const progress = yield this.workoutProgressRepository.createProgress({
                userId: data.userId,
                workoutId: data.workoutId,
                categoryId: workout.category._id.toString(),
                date: data.date || new Date(),
                duration,
                caloriesBurned,
                completed: data.completed || false,
            });
            if (progress.completed) {
                this.socketService.getIO().emit("workoutCompleted", {
                    userId: progress.userId,
                    workoutId: progress.workoutId,
                    timestamp: new Date().toISOString(),
                });
            }
            return progress;
        });
    }
};
exports.CreateWorkoutProgressUseCase = CreateWorkoutProgressUseCase;
exports.CreateWorkoutProgressUseCase = CreateWorkoutProgressUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWorkoutProgressRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [Object, Object, socket_service_1.SocketService])
], CreateWorkoutProgressUseCase);
