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
exports.UpdateUserStatusUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const date_fns_1 = require("date-fns");
let UpdateUserStatusUseCase = class UpdateUserStatusUseCase {
    constructor(_clientRepository, _trainerRepository, _slotRepository, _cancellationRepository, notificationService) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._slotRepository = _slotRepository;
        this._cancellationRepository = _cancellationRepository;
        this.notificationService = notificationService;
    }
    execute(userType, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userType === "client") {
                yield this.handleClientStatusUpdate(userId);
            }
            else if (userType === "trainer") {
                yield this.handleTrainerStatusUpdate(userId);
            }
            else {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
    handleClientStatusUpdate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._clientRepository.findByClientNewId(userId);
            if (!user) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const newStatus = user.status === "active" ? "blocked" : "active";
            yield this._clientRepository.findByIdAndUpdate(user.id, {
                status: newStatus,
            });
        });
    }
    handleTrainerStatusUpdate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this._trainerRepository.findById(userId);
            if (!trainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const newStatus = trainer.status === "active" ? "blocked" : "active";
            yield this._trainerRepository.findByIdAndUpdate(userId, {
                status: newStatus,
            });
            if (newStatus === "blocked") {
                yield this.handleTrainerBlocked(userId);
            }
            else {
                yield this.handleTrainerUnblocked(userId);
            }
        });
    }
    handleTrainerBlocked(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const affectedClients = yield this._clientRepository.findClientsBySelectedTrainerId(trainerId);
            for (const client of affectedClients) {
                try {
                    if (client.backupTrainerId) {
                        // Reassign client to backup trainer
                        yield this._clientRepository.findByIdAndUpdate(client.id, {
                            previousTrainerId: client.selectedTrainerId,
                            selectedTrainerId: client.backupTrainerId,
                            backupTrainerId: null,
                            selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                        });
                        // Handle slot reassignment with conflict check
                        yield this.reassignSlots(client.id, trainerId, client.backupTrainerId);
                        yield this.notificationService.sendToUser(client.id, "Trainer Blocked", `Your primary trainer was blocked. Your backup trainer has been assigned. Slots have been reassigned where possible; please check your schedule for any canceled slots.`, "INFO");
                    }
                    else {
                        // No backup trainer, cancel all slots
                        yield this.cancelSlots(client.id, trainerId, "Trainer blocked, no backup trainer available");
                        yield this.notificationService.sendToUser(client.id, "Trainer Blocked", "Your primary trainer was blocked. Please choose a new trainer manually. All upcoming slots have been canceled.", "WARNING");
                    }
                }
                catch (err) {
                    console.error(`Failed to process client ${client.id}:`, err);
                }
            }
        });
    }
    handleTrainerUnblocked(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientsToRestore = yield this._clientRepository.findClientsByPreviousTrainerId(trainerId);
            for (const client of clientsToRestore) {
                try {
                    // Restore original trainer
                    yield this._clientRepository.updateRaw(client.id, {
                        $set: {
                            selectedTrainerId: trainerId,
                            backupTrainerId: client.selectedTrainerId,
                            selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                        },
                        $unset: {
                            previousTrainerId: "",
                        },
                    });
                    // Reassign slots back to original trainer
                    yield this.reassignSlots(client.id, client.selectedTrainerId, trainerId);
                    yield this.notificationService.sendToUser(client.id, "Trainer Reactivated", `Your original trainer is now active again and has been reassigned to you. Slots have been reassigned where possible; please check your schedule.`, "SUCCESS");
                }
                catch (err) {
                    console.error(`Failed to restore client ${client.id}:`, err);
                }
            }
        });
    }
    reassignSlots(clientId, currentTrainerId, newTrainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this._slotRepository.findBookedSlotsByClientAndTrainer(clientId, currentTrainerId);
            for (const slot of slots) {
                try {
                    const slotStartTime = this.parseSlotDateTime(slot.date, slot.startTime);
                    const slotEndTime = this.parseSlotDateTime(slot.date, slot.endTime);
                    if (slotStartTime < new Date()) {
                        continue; // Skip past slots
                    }
                    // Find if backup trainer has an available slot at same date/time
                    const backupAvailableSlot = yield this._slotRepository.findSlotByTrainerAndTime(newTrainerId, slot.date, slot.startTime, slot.endTime);
                    if (backupAvailableSlot &&
                        backupAvailableSlot.status === constants_1.SlotStatus.AVAILABLE) {
                        // Book backup trainer's slot for client
                        yield this._slotRepository.update(backupAvailableSlot.id, {
                            clientId,
                            status: constants_1.SlotStatus.BOOKED,
                        });
                        // Cancel original slot of primary trainer
                        yield this.cancelSlot(slot, clientId, currentTrainerId, "Trainer blocked, reassigned to backup trainer");
                        console.log(`Reassigned slot ${slot.id} from primary trainer ${currentTrainerId} to backup trainer ${newTrainerId} for client ${clientId}`);
                        // Notify client and backup trainer about reassignment
                        const newTrainer = yield this._trainerRepository.findById(newTrainerId);
                        const formattedDateTime = (0, date_fns_1.format)(slotStartTime, "PPpp");
                        yield this.notificationService.sendToUser(clientId, "Slot Reassigned", `Your session on ${formattedDateTime} has been reassigned to ${newTrainer === null || newTrainer === void 0 ? void 0 : newTrainer.firstName} ${newTrainer === null || newTrainer === void 0 ? void 0 : newTrainer.lastName}.`, "INFO");
                        if (newTrainer) {
                            yield this.notificationService.sendToUser(newTrainerId, "New Session Assigned", `You have been assigned a session with client on ${formattedDateTime}.`, "INFO");
                        }
                    }
                    else {
                        // No available slot for backup trainer - cancel original slot
                        yield this.cancelSlot(slot, clientId, currentTrainerId, "Trainer blocked, no available slot with backup trainer");
                        console.log(`Canceled slot ${slot.id} for client ${clientId} due to no available backup slot.`);
                    }
                }
                catch (err) {
                    console.error(`Failed to process slot ${slot.id}:`, err);
                }
            }
        });
    }
    cancelSlots(clientId, trainerId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this._slotRepository.findBookedSlotsByClientAndTrainer(clientId, trainerId);
            for (const slot of slots) {
                try {
                    const slotStartTime = this.parseSlotDateTime(slot.date, slot.startTime);
                    if (slotStartTime < new Date()) {
                        continue; // Skip past slots
                    }
                    yield this.cancelSlot(slot, clientId, trainerId, reason);
                }
                catch (err) {
                    console.error(`Failed to cancel slot ${slot.id}:`, err);
                }
            }
        });
    }
    cancelSlot(slot, clientId, trainerId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._slotRepository.updateStatus(slot.id, constants_1.SlotStatus.AVAILABLE, undefined, false, reason);
            const cancellationData = {
                slotId: slot.id,
                clientId,
                trainerId,
                cancellationReason: reason,
                cancelledBy: "trainer",
                cancelledAt: new Date(),
            };
            yield this._cancellationRepository.save(cancellationData);
            const slotDateTime = this.parseSlotDateTime(slot.date, slot.startTime);
            const formattedDateTime = (0, date_fns_1.format)(slotDateTime, "PPpp");
            yield this.notificationService.sendToUser(clientId, "Slot Canceled", `Your session on ${formattedDateTime} was canceled due to: ${reason}. Please rebook a new slot.`, "WARNING");
            console.log(`Slot ${slot.id} canceled for client ${clientId} due to: ${reason}`);
        });
    }
    parseSlotDateTime(date, time) {
        const [year, month, day] = date.split("-").map(Number);
        const [hours, minutes] = time.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    }
};
exports.UpdateUserStatusUseCase = UpdateUserStatusUseCase;
exports.UpdateUserStatusUseCase = UpdateUserStatusUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(3, (0, tsyringe_1.inject)("ICancellationRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], UpdateUserStatusUseCase);
