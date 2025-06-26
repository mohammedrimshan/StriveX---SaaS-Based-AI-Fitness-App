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
exports.GetBookedTrainerSlotsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let GetBookedTrainerSlotsUseCase = class GetBookedTrainerSlotsUseCase {
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    execute(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!trainerId || !mongoose_1.Types.ObjectId.isValid(trainerId)) {
                throw new custom_error_1.CustomError("Valid Trainer ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const slots = yield this.slotRepository.findSlotsWithClients(trainerId);
            return slots
                .filter((slot) => slot.status === constants_1.SlotStatus.BOOKED || slot.cancellationReason)
                .map((slot) => {
                var _a;
                return ({
                    id: slot.id,
                    trainerId: slot.trainerId.toString(),
                    trainerName: slot.trainerName || "Unknown Trainer",
                    clientId: slot.clientId,
                    clientName: ((_a = slot.client) === null || _a === void 0 ? void 0 : _a.firstName)
                        ? `${slot.client.firstName} ${slot.client.lastName}`
                        : "Unknown Client",
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: slot.status,
                    isBooked: slot.isBooked,
                    isAvailable: slot.isAvailable,
                    cancellationReason: slot.cancellationReason,
                    videoCallStatus: slot.videoCallStatus,
                    videoCallRoomName: slot.videoCallRoomName,
                    client: slot.client,
                });
            });
        });
    }
};
exports.GetBookedTrainerSlotsUseCase = GetBookedTrainerSlotsUseCase;
exports.GetBookedTrainerSlotsUseCase = GetBookedTrainerSlotsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __metadata("design:paramtypes", [Object])
], GetBookedTrainerSlotsUseCase);
