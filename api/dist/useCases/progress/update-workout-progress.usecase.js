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
exports.UpdateWorkoutProgressUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const socket_service_1 = require("@/interfaceAdapters/services/socket.service");
let UpdateWorkoutProgressUseCase = class UpdateWorkoutProgressUseCase {
    constructor(workoutProgressRepository, clientRepository, socketService) {
        this.workoutProgressRepository = workoutProgressRepository;
        this.clientRepository = clientRepository;
        this.socketService = socketService;
    }
    execute(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                throw new custom_error_1.CustomError("Progress ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (updates.duration && updates.duration <= 0) {
                throw new custom_error_1.CustomError("Duration must be positive", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (updates.userId) {
                const client = yield this.clientRepository.findByClientId(updates.userId.toString());
                if (!client) {
                    throw new custom_error_1.CustomError("User not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
            }
            const progress = yield this.workoutProgressRepository.updateProgress(id, updates);
            if (!progress) {
                throw new custom_error_1.CustomError("Progress not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (progress.completed && updates.completed) {
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
exports.UpdateWorkoutProgressUseCase = UpdateWorkoutProgressUseCase;
exports.UpdateWorkoutProgressUseCase = UpdateWorkoutProgressUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWorkoutProgressRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [Object, Object, socket_service_1.SocketService])
], UpdateWorkoutProgressUseCase);
