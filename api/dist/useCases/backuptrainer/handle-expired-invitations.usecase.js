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
exports.HandleExpiredInvitationsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const mongoose_1 = __importDefault(require("mongoose"));
let HandleExpiredInvitationsUseCase = class HandleExpiredInvitationsUseCase {
    constructor(clientRepository, trainerRepository, invitationRepository, notificationRepository, notificationService) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.invitationRepository = invitationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const expiredInvitations = yield this.invitationRepository.findExpiredInvitations();
            for (const invitation of expiredInvitations) {
                const client = yield this.clientRepository.findByClientId(invitation.clientId);
                if (!client)
                    continue;
                // Check if a backup trainer is already assigned
                if (client.backupTrainerId && client.backupTrainerStatus === constants_1.BackupInvitationStatus.ACCEPTED) {
                    yield this.invitationRepository.updateStatus(invitation.id, constants_1.BackupInvitationStatus.REJECTED);
                    continue;
                }
                // Find a random available trainer
                const excludedTrainerIds = [client.selectedTrainerId, client.backupTrainerId]
                    .filter((id) => typeof id === "string")
                    .map(id => new mongoose_1.default.Types.ObjectId(id));
                const trainers = yield this.trainerRepository.findAvailableBackupTrainers(client, excludedTrainerIds);
                if (!trainers.length) {
                    yield this.notificationRepository.save({
                        userId: client.clientId,
                        title: "Backup Trainer Assignment Failed",
                        message: "No available backup trainers found. Please contact support.",
                        type: "ERROR"
                    });
                    continue;
                }
                const randomTrainer = trainers[Math.floor(Math.random() * trainers.length)];
                // Assign as fallback
                yield this.invitationRepository.save({
                    clientId: client.clientId,
                    trainerId: randomTrainer.clientId,
                    status: constants_1.BackupInvitationStatus.AUTO_ASSIGNED,
                    isFallback: true,
                    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours for opt-out
                });
                // Update client and trainer
                yield this.clientRepository.updateBackupTrainer(client.clientId, randomTrainer.clientId, constants_1.BackupInvitationStatus.AUTO_ASSIGNED);
                yield this.trainerRepository.addBackupClient(randomTrainer.clientId, client.clientId);
                // Notify trainer
                yield this.notificationRepository.save({
                    userId: randomTrainer.clientId,
                    title: "Backup Trainer Auto-Assigned",
                    message: `You have been auto-assigned as a backup trainer for ${client.firstName} ${client.lastName}. You can opt out within 12 hours.`,
                    type: "INFO",
                    actionLink: `/trainer/invitations/${invitation.id}/reject`
                });
                yield this.notificationService.sendToUser(randomTrainer.id, "Backup Trainer Auto-Assigned", `You have been auto-assigned as a backup trainer for ${client.firstName} ${client.lastName}.`, "INFO");
                // Notify client
                yield this.notificationRepository.save({
                    userId: client.clientId,
                    title: "Backup Trainer Auto-Assigned",
                    message: `Trainer ${randomTrainer.firstName} ${randomTrainer.lastName} has been auto-assigned as your backup trainer.`,
                    type: "SUCCESS"
                });
            }
        });
    }
};
exports.HandleExpiredInvitationsUseCase = HandleExpiredInvitationsUseCase;
exports.HandleExpiredInvitationsUseCase = HandleExpiredInvitationsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IBackupTrainerInvitationRepository")),
    __param(3, (0, tsyringe_1.inject)("INotificationRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], HandleExpiredInvitationsUseCase);
