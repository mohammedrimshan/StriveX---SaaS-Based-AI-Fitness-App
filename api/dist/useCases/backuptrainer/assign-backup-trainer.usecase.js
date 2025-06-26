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
exports.AssignBackupTrainerUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const mongoose_1 = __importDefault(require("mongoose"));
let AssignBackupTrainerUseCase = class AssignBackupTrainerUseCase {
    constructor(clientRepository, trainerRepository, invitationRepository, notificationRepository, notificationService) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.invitationRepository = invitationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }
    execute(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!client.selectedTrainerId || client.selectStatus !== constants_1.TrainerSelectionStatus.ACCEPTED) {
                throw new custom_error_1.CustomError("Primary trainer must be accepted before assigning backup", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const excludedTrainerIds = [
                new mongoose_1.default.Types.ObjectId(client.selectedTrainerId),
                ...(client.backupTrainerId ? [new mongoose_1.default.Types.ObjectId(client.backupTrainerId)] : []),
            ];
            const trainers = yield this.trainerRepository.findAvailableBackupTrainers(client, excludedTrainerIds);
            if (!trainers.length) {
                throw new custom_error_1.CustomError("No available backup trainers found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const topTrainers = trainers.slice(0, 3);
            const invitationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            for (const trainer of topTrainers) {
                if (!trainer.id || !mongoose_1.default.Types.ObjectId.isValid(trainer.id)) {
                    console.warn(`Skipped invalid trainer ID: ${trainer.id}`);
                    continue;
                }
                const trainerExists = yield this.trainerRepository.findById(trainer.id);
                if (!trainerExists) {
                    console.warn(`Trainer not found in DB: ${trainer.id}`);
                    continue;
                }
                const invitation = {
                    clientId,
                    trainerId: trainer.id,
                    status: constants_1.BackupInvitationStatus.PENDING,
                    expiresAt: invitationExpiry,
                };
                yield this.invitationRepository.save(invitation);
                console.log("Sending notification to trainer:", trainer.id);
                yield this.notificationService.sendToUser(trainer.id, "Backup Trainer Invitation", `You have been invited to be a backup trainer for ${client.firstName} ${client.lastName}.`, "SUCCESS");
            }
            return client;
        });
    }
};
exports.AssignBackupTrainerUseCase = AssignBackupTrainerUseCase;
exports.AssignBackupTrainerUseCase = AssignBackupTrainerUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IBackupTrainerInvitationRepository")),
    __param(3, (0, tsyringe_1.inject)("INotificationRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], AssignBackupTrainerUseCase);
