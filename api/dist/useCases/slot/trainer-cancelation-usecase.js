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
exports.TrainerSlotCancellationUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("../../interfaceAdapters/services/notification.service");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
let TrainerSlotCancellationUseCase = class TrainerSlotCancellationUseCase {
    constructor(slotRepository, cancellationRepository, trainerRepository, clientRepository, notificationService, reassignTrainerUseCase) {
        this.slotRepository = slotRepository;
        this.cancellationRepository = cancellationRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
        this.notificationService = notificationService;
        this.reassignTrainerUseCase = reassignTrainerUseCase;
    }
    execute(trainerId, slotId, cancellationReason) {
        return __awaiter(this, void 0, void 0, function* () {
            // Step 1: Validate trainer
            const trainer = yield this.trainerRepository.findById(trainerId);
            if (!trainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            // Step 2: Validate slot
            const slot = yield this.slotRepository.findById(slotId);
            if (!slot || slot.trainerId.toString() !== trainerId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SLOT_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!slot.isBooked || !slot.clientId) {
                throw new custom_error_1.CustomError("Slot is not booked by a client", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Step 3: Validate cancellation window (at least 30 minutes before start)
            const [year, month, day] = slot.date.split("-").map(Number);
            const [hours, minutes] = slot.startTime.split(":").map(Number);
            const slotStartTime = new Date(year, month - 1, day, hours, minutes);
            if (isNaN(slotStartTime.getTime())) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_SLOT_DATE_TIME, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            const cancellationThreshold = new Date(slotStartTime.getTime() - 30 * 60 * 1000);
            if (new Date() > cancellationThreshold) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.CANNOT_CANCEL_WITHIN_30_MINUTES, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Step 4: Validate cancellation reason
            if (!cancellationReason || cancellationReason.trim() === "") {
                throw new custom_error_1.CustomError("Cancellation reason is required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Step 5: Attempt reassignment using injected use case
            try {
                const reassignedSlot = yield this.reassignTrainerUseCase.execute(slotId, cancellationReason);
                // Save cancellation record
                const cancellationData = {
                    slotId: slotId,
                    clientId: slot.clientId,
                    trainerId: trainerId,
                    cancellationReason: cancellationReason,
                    cancelledBy: "trainer", // Added cancelledBy field
                    cancelledAt: new Date(),
                };
                yield this.cancellationRepository.save(cancellationData);
                return reassignedSlot;
            }
            catch (error) {
                console.error("Reassignment failed:", error);
                throw new custom_error_1.CustomError(`Failed to reassign or cancel slot: ${error.message || error}`, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.TrainerSlotCancellationUseCase = TrainerSlotCancellationUseCase;
exports.TrainerSlotCancellationUseCase = TrainerSlotCancellationUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("ICancellationRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(3, (0, tsyringe_1.inject)("IClientRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __param(5, (0, tsyringe_1.inject)("IReassignTrainerUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService, Object])
], TrainerSlotCancellationUseCase);
