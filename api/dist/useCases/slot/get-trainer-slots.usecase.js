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
exports.GetTrainerSlotsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetTrainerSlotsUseCase = class GetTrainerSlotsUseCase {
    constructor(slotRepository, trainerRepository, clientRepository) {
        this.slotRepository = slotRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
    }
    execute(trainerId, startTime, endTime, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!trainerId) {
                throw new custom_error_1.CustomError("Trainer ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (role && role !== "trainer" && role !== "client") {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (role === "trainer") {
                const trainer = yield this.trainerRepository.findById(trainerId);
                if (!trainer) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
                }
            }
            else if (role === "client") {
                const client = yield this.clientRepository.findById(trainerId);
                if (!client) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
                }
            }
            const slots = yield this.slotRepository.getSlotsWithStatus(trainerId, startTime, endTime);
            return slots;
        });
    }
};
exports.GetTrainerSlotsUseCase = GetTrainerSlotsUseCase;
exports.GetTrainerSlotsUseCase = GetTrainerSlotsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetTrainerSlotsUseCase);
