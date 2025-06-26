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
exports.RequestBackupTrainerChangeUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
let RequestBackupTrainerChangeUseCase = class RequestBackupTrainerChangeUseCase {
    constructor(clientRepository, changeRequestRepository, notificationService, adminRepository) {
        this.clientRepository = clientRepository;
        this.changeRequestRepository = changeRequestRepository;
        this.notificationService = notificationService;
        this.adminRepository = adminRepository;
    }
    execute(clientId, requestType, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!reason || !reason.trim()) {
                throw new custom_error_1.CustomError(`Reason is required for ${requestType} requests`, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!client.backupTrainerId || !client.backupTrainerStatus) {
                throw new custom_error_1.CustomError("No backup trainer assigned", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingRequests = yield this.changeRequestRepository.findByClientId(clientId);
            if (existingRequests.some((req) => req.status === constants_1.TrainerChangeRequestStatus.PENDING)) {
                throw new custom_error_1.CustomError("A pending change request already exists", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const changeRequest = {
                clientId,
                backupTrainerId: client.backupTrainerId,
                requestType,
                reason,
                status: constants_1.TrainerChangeRequestStatus.PENDING,
            };
            const savedRequest = yield this.changeRequestRepository.save(changeRequest);
            const requestId = (_a = savedRequest.id) === null || _a === void 0 ? void 0 : _a.toString();
            // Notify client
            yield this.notificationService.sendToUser(client.id, `Backup Trainer ${requestType} Request`, `Your request to ${requestType.toLowerCase()} your backup trainer is pending review.\nReason: ${reason}`, "WARNING");
            // Fetch admins
            const { items: admins } = yield this.adminRepository.find({ role: "admin" }, 0, 1000);
            if (!(admins === null || admins === void 0 ? void 0 : admins.length)) {
                throw new custom_error_1.CustomError("Admin not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const adminMessage = `Client ${client.firstName} ${client.lastName} has requested to ${requestType.toLowerCase()} their backup trainer.`;
            yield Promise.all(admins.map((admin) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.notificationService.sendToUser(admin.id, `New Backup Trainer Change Request\nReason: ${reason}`, adminMessage, "INFO", `/admin/change-requests/${requestId}`, requestId);
                }
                catch (err) {
                    console.error(`Failed to notify admin ${admin.id}:`, err);
                }
            })));
            return savedRequest;
        });
    }
};
exports.RequestBackupTrainerChangeUseCase = RequestBackupTrainerChangeUseCase;
exports.RequestBackupTrainerChangeUseCase = RequestBackupTrainerChangeUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerChangeRequestRepository")),
    __param(2, (0, tsyringe_1.inject)("NotificationService")),
    __param(3, (0, tsyringe_1.inject)("IAdminRepository")),
    __metadata("design:paramtypes", [Object, Object, notification_service_1.NotificationService, Object])
], RequestBackupTrainerChangeUseCase);
