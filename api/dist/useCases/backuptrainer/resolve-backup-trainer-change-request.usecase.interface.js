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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveBackupTrainerChangeRequestUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
let ResolveBackupTrainerChangeRequestUseCase = class ResolveBackupTrainerChangeRequestUseCase {
    constructor(clientRepository, trainerRepository, changeRequestRepository, notificationRepository, assignBackupTrainerUseCase, notificationService) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.changeRequestRepository = changeRequestRepository;
        this.notificationRepository = notificationRepository;
        this.assignBackupTrainerUseCase = assignBackupTrainerUseCase;
        this.notificationService = notificationService;
    }
    execute(requestId, adminId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield this.changeRequestRepository.findById(requestId);
            if (!request) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.REQUEST_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (request.status !== constants_1.TrainerChangeRequestStatus.PENDING) {
                throw new custom_error_1.CustomError("Request is not pending", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const clientId = request.clientId;
            if (!mongoose_1.default.Types.ObjectId.isValid(clientId)) {
                throw new custom_error_1.CustomError("Invalid client ID format", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (action === "approve") {
                yield this.handleApproval(request, client.id); // Use MongoDB _id string
            }
            const updatedStatus = action === "approve"
                ? constants_1.TrainerChangeRequestStatus.APPROVED
                : constants_1.TrainerChangeRequestStatus.REJECTED;
            const updatedRequest = yield this.changeRequestRepository.updateStatus(requestId, updatedStatus, adminId);
            if (!updatedRequest) {
                throw new custom_error_1.CustomError("Failed to update change request", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            const notificationType = action === "approve" ? "SUCCESS" : "ERROR";
            const statusText = action === "approve" ? "Approved" : "Rejected";
            yield this.notificationService.sendToUser(client.id, `Backup Trainer ${request.requestType} Request ${statusText}`, `Your request to ${request.requestType.toLowerCase()} your backup trainer has been ${statusText.toLowerCase()}.`, notificationType);
            return updatedRequest;
        });
    }
    handleApproval(request, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.requestType === "REVOKE") {
                yield this.clientRepository.clearBackupTrainer(clientId);
                yield this.trainerRepository.removeBackupClient(request.backupTrainerId, clientId);
            }
            else if (request.requestType === "CHANGE") {
                yield this.clientRepository.clearBackupTrainer(clientId);
                yield this.trainerRepository.removeBackupClient(request.backupTrainerId, clientId);
                yield this.assignBackupTrainerUseCase.execute(clientId);
            }
        });
    }
};
exports.ResolveBackupTrainerChangeRequestUseCase = ResolveBackupTrainerChangeRequestUseCase;
exports.ResolveBackupTrainerChangeRequestUseCase = ResolveBackupTrainerChangeRequestUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerChangeRequestRepository")),
    __param(3, (0, tsyringe_1.inject)("INotificationRepository")),
    __param(4, (0, tsyringe_1.inject)("IAssignBackupTrainerUseCase")),
    __param(5, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, notification_service_1.NotificationService])
], ResolveBackupTrainerChangeRequestUseCase);
