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
exports.CancelBookingUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
const notification_service_1 = require("../../interfaceAdapters/services/notification.service");
let CancelBookingUseCase = class CancelBookingUseCase {
    constructor(slotRepository, cancellationRepository, clientRepository, trainerRepository, notificationService) {
        this.slotRepository = slotRepository;
        this.cancellationRepository = cancellationRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.notificationService = notificationService;
    }
    execute(clientId, slotId, cancellationReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.slotRepository.findBookedSlotByClientId(clientId, slotId);
            if (!slot) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SLOT_NOT_FOUND_OR_NOT_BOOKED, constants_1.HTTP_STATUS.NOT_FOUND);
            }
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
            if (!cancellationReason || cancellationReason.trim() === "") {
                throw new custom_error_1.CustomError("Cancellation reason is required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updatedSlot = yield this.slotRepository.updateStatus(slotId, constants_1.SlotStatus.AVAILABLE, undefined, false, cancellationReason);
            if (!updatedSlot) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_CANCEL_BOOKING, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // Create a properly typed cancellation record
            const cancellationData = {
                slotId: slotId,
                clientId: clientId,
                trainerId: slot.trainerId,
                cancellationReason: cancellationReason,
                cancelledBy: "client",
                cancelledAt: new Date(),
            };
            console.log("Cancellation data before save:", cancellationData);
            yield this.cancellationRepository.save(cancellationData);
            try {
                let clientName = "Someone";
                const client = yield this.clientRepository.findByClientNewId(clientId);
                if (client) {
                    clientName = `${client.firstName} ${client.lastName}`;
                }
                const trainer = yield this.trainerRepository.findById(slot.trainerId);
                if (trainer) {
                    yield this.notificationService.sendToUser(slot.trainerId, "Slot Cancellation", `${clientName} canceled their booking for your slot on ${slot.date} at ${slot.startTime}. Reason: ${cancellationReason}`, "WARNING");
                }
            }
            catch (error) {
                console.error("Notification error:", error);
            }
            return updatedSlot;
        });
    }
};
exports.CancelBookingUseCase = CancelBookingUseCase;
exports.CancelBookingUseCase = CancelBookingUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("ICancellationRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __param(3, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], CancelBookingUseCase);
