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
exports.AcceptRejectBackupInvitationUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
let AcceptRejectBackupInvitationUseCase = class AcceptRejectBackupInvitationUseCase {
    constructor(clientRepository, trainerRepository, invitationRepository, notificationRepository, notificationService) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.invitationRepository = invitationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }
    execute(invitationId, trainerId, // MongoDB _id of the trainer
    action) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitation = yield this.invitationRepository.findById(invitationId);
            if (!invitation || invitation.trainerId !== trainerId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVITATION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (invitation.status !== constants_1.BackupInvitationStatus.PENDING ||
                invitation.expiresAt <= new Date()) {
                throw new custom_error_1.CustomError("Invitation is not pending or has expired", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const client = yield this.clientRepository.findById(invitation.clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const trainer = yield this.trainerRepository.findById(trainerId);
            if (!trainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (action === "accept") {
                // 1. Attempt atomic update to assign backup trainer only if none assigned yet
                const updatedClient = yield this.clientRepository.updateBackupTrainerIfNotAssigned(client.clientId, trainerId, constants_1.BackupInvitationStatus.ACCEPTED);
                if (!updatedClient) {
                    // Someone else already accepted first
                    throw new custom_error_1.CustomError("Backup trainer already assigned to another trainer", constants_1.HTTP_STATUS.CONFLICT);
                }
                // 2. Mark this invitation as ACCEPTED
                yield this.invitationRepository.updateStatus(invitationId, constants_1.BackupInvitationStatus.ACCEPTED, new Date());
                // 3. Add client to trainer's backupClientIds
                const updatedTrainer = yield this.trainerRepository.addBackupClient(trainerId, client.id);
                if (!updatedTrainer) {
                    throw new custom_error_1.CustomError("Failed to update trainer backup clients", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                // 4. Reject other pending invitations in bulk
                yield this.invitationRepository.updateManyStatusByClientIdExcept(client.clientId, invitationId, constants_1.BackupInvitationStatus.REJECTED, new Date());
                // 5. Notify rejected trainers about rejection
                // Fetch the rejected invitations to notify trainers
                const rejectedInvitations = yield this.invitationRepository.findByClientIdAndStatus(client.clientId, constants_1.BackupInvitationStatus.REJECTED);
                for (const invite of rejectedInvitations) {
                    if (invite.id !== invitationId) {
                        yield this.notificationService.sendToUser(invite.trainerId, "Backup Invitation Expired", `Your backup trainer invitation for ${client.firstName} ${client.lastName} was not selected.`, "INFO");
                    }
                }
                // 6. Notify client about the assigned backup trainer
                yield this.notificationService.sendToUser(client.id, "Backup Trainer Assigned", `Trainer ${trainer.firstName} ${trainer.lastName} has been assigned as your backup trainer.`, "SUCCESS");
                return updatedClient;
            }
            else {
                // Reject case: mark invitation as REJECTED
                yield this.invitationRepository.updateStatus(invitationId, constants_1.BackupInvitationStatus.REJECTED, new Date());
                yield this.notificationService.sendToUser(client.id, "Backup Trainer Invitation Rejected", `Trainer ${trainer.firstName} ${trainer.lastName} has declined your backup trainer invitation.`, "ERROR");
                return client;
            }
        });
    }
};
exports.AcceptRejectBackupInvitationUseCase = AcceptRejectBackupInvitationUseCase;
exports.AcceptRejectBackupInvitationUseCase = AcceptRejectBackupInvitationUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IBackupTrainerInvitationRepository")),
    __param(3, (0, tsyringe_1.inject)("INotificationRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], AcceptRejectBackupInvitationUseCase);
