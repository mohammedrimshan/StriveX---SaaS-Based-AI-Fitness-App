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
exports.BookSlotUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
const constants_2 = require("../../shared/constants");
const notification_service_1 = require("../../interfaceAdapters/services/notification.service");
let BookSlotUseCase = class BookSlotUseCase {
    constructor(_slotRepository, _clientRepository, _trainerRepository, _notificationService) {
        this._slotRepository = _slotRepository;
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._notificationService = _notificationService;
    }
    execute(clientId, slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this._slotRepository.findById(slotId);
            if (!slot) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SLOT_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (slot.status !== constants_2.SlotStatus.AVAILABLE) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SLOT_NOT_AVAILABLE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const [year, month, day] = slot.date.split("-").map(Number);
            const [hours, minutes] = slot.startTime.split(":").map(Number);
            const slotStartTime = new Date(year, month - 1, day, hours, minutes);
            if (isNaN(slotStartTime.getTime())) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_SLOT_DATE_TIME, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            if (slotStartTime < new Date()) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.PAST_SLOT_BOOKING, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingSlot = yield this._slotRepository.findBookedSlotByClientIdAndDate(clientId, slot.date);
            if (existingSlot) {
                throw new custom_error_1.CustomError("You have already booked a slot for this date", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updatedSlot = yield this._slotRepository.updateStatus(slotId, constants_2.SlotStatus.BOOKED, clientId);
            if (!updatedSlot) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_BOOKING_SLOT, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            try {
                let clientName = "Someone";
                const client = yield this._clientRepository.findByClientNewId(clientId);
                if (client) {
                    clientName = `${client.firstName} ${client.lastName}`;
                }
                const trainer = yield this._trainerRepository.findById(slot.trainerId);
                if (trainer) {
                    yield this._notificationService.sendToUser(slot.trainerId, "Slot Booked", `${clientName} booked your slot on ${slot.date} at ${slot.startTime}!`, "SUCCESS");
                }
            }
            catch (error) {
                console.error("Notification error:", error);
            }
            return updatedSlot;
        });
    }
};
exports.BookSlotUseCase = BookSlotUseCase;
exports.BookSlotUseCase = BookSlotUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(3, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, notification_service_1.NotificationService])
], BookSlotUseCase);
