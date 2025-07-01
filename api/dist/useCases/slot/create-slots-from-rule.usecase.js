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
exports.CreateSlotsFromRuleUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants");
const custom_error_1 = require("../../entities/utils/custom.error");
const slot_expiry_setup_1 = __importDefault(require("../../frameworks/queue/bull/slot-expiry.setup"));
let CreateSlotsFromRuleUseCase = class CreateSlotsFromRuleUseCase {
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { trainerId, rules, fromDate, toDate, slotDurationInMinutes = 30 } = input;
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_DATE_FORMAT, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const allSlots = [];
            for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
                const weekday = current.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                const rule = rules[weekday];
                if (!rule)
                    continue;
                const [startH, startM] = rule.start.split(":").map(Number);
                const [endH, endM] = rule.end.split(":").map(Number);
                const dayStart = new Date(current);
                dayStart.setHours(startH, startM, 0, 0);
                const dayEnd = new Date(current);
                dayEnd.setHours(endH, endM, 0, 0);
                while (dayStart < dayEnd) {
                    const slotStart = new Date(dayStart);
                    const slotEnd = new Date(dayStart);
                    slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationInMinutes);
                    if (slotEnd > dayEnd)
                        break;
                    // Check for overlap
                    const overlaps = yield this.slotRepository.findOverlappingSlots(trainerId, slotStart, slotEnd);
                    if (overlaps.length === 0) {
                        const formattedDate = current.toISOString().split("T")[0];
                        const formattedStart = slotStart.toTimeString().substring(0, 5);
                        const formattedEnd = slotEnd.toTimeString().substring(0, 5);
                        const newSlot = {
                            trainerId,
                            date: formattedDate,
                            startTime: formattedStart,
                            endTime: formattedEnd,
                            status: constants_1.SlotStatus.AVAILABLE,
                            isBooked: false,
                            isAvailable: true,
                            expiresAt: new Date(slotEnd),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };
                        const savedSlot = yield this.slotRepository.save(newSlot);
                        allSlots.push(savedSlot);
                        // Schedule expiry
                        const delay = slotEnd.getTime() - Date.now();
                        if (delay > 0) {
                            yield slot_expiry_setup_1.default.add({ slotId: savedSlot.id }, { delay });
                        }
                    }
                    dayStart.setMinutes(dayStart.getMinutes() + slotDurationInMinutes);
                }
            }
            return allSlots;
        });
    }
};
exports.CreateSlotsFromRuleUseCase = CreateSlotsFromRuleUseCase;
exports.CreateSlotsFromRuleUseCase = CreateSlotsFromRuleUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __metadata("design:paramtypes", [Object])
], CreateSlotsFromRuleUseCase);
