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
exports.ReassignTrainerUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let ReassignTrainerUseCase = class ReassignTrainerUseCase {
    constructor(slotRepository, trainerRepository, clientRepository, cancellationRepository, notificationService) {
        this.slotRepository = slotRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
        this.cancellationRepository = cancellationRepository;
        this.notificationService = notificationService;
    }
    execute(slotId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.slotRepository.findById(slotId);
            if (!slot || !slot.isBooked || !slot.clientId) {
                throw new custom_error_1.CustomError("Slot not found or not booked", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const client = yield this.clientRepository.findById(slot.clientId);
            if (!client) {
                throw new custom_error_1.CustomError("Client not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            // Step 1: Backup trainer
            if (client.backupTrainerId) {
                const backupTrainer = yield this.trainerRepository.findById(client.backupTrainerId);
                if (backupTrainer &&
                    backupTrainer.approvalStatus === constants_1.TrainerApprovalStatus.APPROVED &&
                    !backupTrainer.optOutBackupRole &&
                    backupTrainer.status === "active") {
                    const availableSlot = yield this.slotRepository.findSlotByTrainerAndTime(client.backupTrainerId.toString(), slot.date, slot.startTime, slot.endTime);
                    if (availableSlot && !availableSlot.isBooked) {
                        const updatedSlot = yield this.slotRepository.update(availableSlot.id, {
                            clientId: client.id,
                            isBooked: true,
                            isAvailable: false,
                            trainerId: backupTrainer.id,
                            previousTrainerId: [slot.trainerId],
                            cancellationReason: reason,
                            status: constants_1.SlotStatus.BOOKED,
                            bookedAt: new Date(),
                        });
                        if (!updatedSlot) {
                            throw new custom_error_1.CustomError("Failed to assign slot to backup trainer", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                        }
                        yield this.sendNotifications(client, backupTrainer, slot, updatedSlot, reason);
                        try {
                            yield this.trainerRepository.addBackupClient(backupTrainer.id.toString(), client.id);
                        }
                        catch (err) {
                            console.error("Failed to add backup client", err);
                        }
                        yield this.slotRepository.delete(slot.id);
                        yield this.cancellationRepository.save({
                            slotId: slot.id,
                            clientId: slot.clientId,
                            trainerId: slot.trainerId,
                            cancellationReason: reason,
                            cancelledBy: "trainer",
                            cancelledAt: new Date(),
                        });
                        return updatedSlot;
                    }
                }
            }
            // Step 2: Find top 3 eligible trainers excluding primary & backup
            const excludedTrainerIds = [
                slot.trainerId,
                ...(slot.previousTrainerId || []),
                client.selectedTrainerId,
                client.backupTrainerId,
            ]
                .filter((id) => !!id && mongoose_1.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_1.Types.ObjectId(id));
            console.log(excludedTrainerIds, "EXCLUDED TRAINERS");
            const topTrainers = yield this.trainerRepository.findAvailableBackupTrainers(client, excludedTrainerIds);
            console.log(topTrainers, "TOP TRAINERS");
            for (const trainer of topTrainers) {
                const hasConflict = yield this.slotRepository.findSlotByTrainerAndTime(trainer.id.toString(), slot.date, slot.startTime, slot.endTime);
                if (!hasConflict || !hasConflict.isBooked) {
                    return yield this.assignSlotToTrainer(slot, client, trainer, reason);
                }
            }
            // Step 3: Fallback — cancel the session
            const updatedSlot = yield this.slotRepository.updateStatus(slotId, constants_1.SlotStatus.AVAILABLE, undefined, false, reason);
            if (!updatedSlot) {
                throw new custom_error_1.CustomError("Failed to cancel slot", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            yield this.cancellationRepository.save({
                slotId,
                clientId: slot.clientId,
                trainerId: slot.trainerId,
                cancellationReason: reason,
                cancelledBy: "trainer",
                cancelledAt: new Date(),
            });
            yield this.notificationService.sendToUser(slot.clientId.toString(), "Slot Cancelled", `Your session on ${slot.date} at ${slot.startTime} was cancelled due to trainer emergency: ${reason}. Please rebook.`, "WARNING");
            yield this.notificationService.sendToUser(slot.trainerId.toString(), "Slot Cancellation Confirmed", `Your session on ${slot.date} at ${slot.startTime} was cancelled due to: ${reason}.`, "INFO");
            return updatedSlot;
        });
    }
    assignSlotToTrainer(slot, client, trainer, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const previousTrainerId = [
                ...(slot.previousTrainerId || []),
                slot.trainerId.toString(),
            ];
            const updatedSlot = yield this.slotRepository.update(slot.id, {
                trainerId: trainer.id.toString(),
                previousTrainerId,
                cancellationReason: reason,
                status: constants_1.SlotStatus.BOOKED,
                isBooked: true,
                isAvailable: false,
                bookedAt: new Date(),
                clientId: client.id.toString(),
            });
            if (!updatedSlot) {
                throw new custom_error_1.CustomError("Failed to reassign trainer", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            yield this.sendNotifications(client, trainer, slot, updatedSlot, reason);
            try {
                yield this.trainerRepository.addBackupClient(trainer.id.toString(), client.id.toString());
            }
            catch (err) {
                console.error("Failed to add backup client to trainer", err);
            }
            // Remove this deletion to keep the slot
            // await this.slotRepository.delete(slot.id!);
            yield this.cancellationRepository.save({
                slotId: slot.id,
                clientId: slot.clientId,
                trainerId: slot.trainerId,
                cancellationReason: reason,
                cancelledBy: "trainer",
                cancelledAt: new Date(),
            });
            return updatedSlot;
        });
    }
    sendNotifications(client, trainer, oldSlot, newSlot, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientName = `${client.firstName} ${client.lastName}`;
            const trainerName = `${trainer.firstName} ${trainer.lastName}`;
            yield this.notificationService.sendToUser(client.id.toString(), "Trainer Reassigned", `Your session on ${oldSlot.date} at ${oldSlot.startTime} has been reassigned to ${trainerName} due to: ${reason}.`, "INFO", `/slots/${newSlot.id}`);
            yield this.notificationService.sendToUser(trainer.id.toString(), "New Session Assigned", `You have been assigned a session with ${clientName} on ${oldSlot.date} at ${oldSlot.startTime} due to: ${reason}.`, "INFO", `/slots/${newSlot.id}`);
        });
    }
};
exports.ReassignTrainerUseCase = ReassignTrainerUseCase;
exports.ReassignTrainerUseCase = ReassignTrainerUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __param(3, (0, tsyringe_1.inject)("ICancellationRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], ReassignTrainerUseCase);
