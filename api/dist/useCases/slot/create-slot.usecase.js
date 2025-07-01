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
exports.CreateSlotUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../entities/utils/custom.error");
const constants_1 = require("../../shared/constants");
const slot_expiry_setup_1 = __importDefault(require("../../frameworks/queue/bull/slot-expiry.setup"));
const constants_2 = require("../../shared/constants");
let CreateSlotUseCase = class CreateSlotUseCase {
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    execute(trainerId, slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            const slotDate = new Date(slotData.date);
            if (isNaN(slotDate.getTime())) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_DATE_FORMAT, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const [startHours, startMinutes] = slotData.startTime
                .split(":")
                .map(Number);
            const [endHours, endMinutes] = slotData.endTime.split(":").map(Number);
            const startTime = new Date(slotDate);
            startTime.setHours(startHours, startMinutes, 0, 0);
            const endTime = new Date(slotDate);
            endTime.setHours(endHours, endMinutes, 0, 0);
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TIME_FORMAT(slotData.startTime, slotData.endTime), constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (startTime >= endTime) {
                const isNextDaySlot = endTime.getDate() !== startTime.getDate();
                if (isNextDaySlot) {
                    throw new custom_error_1.CustomError("Slot time cannot span across multiple days. Please select a time range within the same day.", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.START_TIME_BEFORE_END_TIME(slotData.startTime, slotData.endTime), constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            if (durationInMinutes !== 30) {
                throw new custom_error_1.CustomError(`Each slot must be exactly 30 minutes. Given duration is ${durationInMinutes} minutes.`, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const overlappingSlots = yield this.slotRepository.findOverlappingSlots(trainerId, startTime, endTime);
            if (overlappingSlots.length > 0) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SLOT_OVERLAPS(slotData.startTime, slotData.endTime), constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const formattedDate = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, "0")}-${String(slotDate.getDate()).padStart(2, "0")}`;
            const formattedStartTime = `${String(startHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;
            const formattedEndTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
            const [year, month, day] = formattedDate.split("-").map(Number);
            const expiresAt = new Date(year, month - 1, day, endHours, endMinutes);
            const slot = {
                trainerId,
                date: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                status: constants_2.SlotStatus.AVAILABLE,
                isBooked: false,
                isAvailable: true,
                expiresAt,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const savedSlot = yield this.slotRepository.save(slot);
            const slotEndTime = new Date(slotDate);
            slotEndTime.setHours(endHours, endMinutes, 0, 0);
            const delay = slotEndTime.getTime() - Date.now();
            if (delay > 0) {
                yield slot_expiry_setup_1.default.add({ slotId: savedSlot.id }, { delay: expiresAt.getTime() - Date.now() });
            }
            return savedSlot;
        });
    }
};
exports.CreateSlotUseCase = CreateSlotUseCase;
exports.CreateSlotUseCase = CreateSlotUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __metadata("design:paramtypes", [Object])
], CreateSlotUseCase);
