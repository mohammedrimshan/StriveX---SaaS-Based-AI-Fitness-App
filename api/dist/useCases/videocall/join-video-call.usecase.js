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
exports.JoinVideoCallUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_2 = require("@/shared/constants");
let JoinVideoCallUseCase = class JoinVideoCallUseCase {
    constructor(slotRepository, clientRepository, trainerRepository) {
        this.slotRepository = slotRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(slotId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.slotRepository.findById(slotId);
            if (!slot) {
                throw new custom_error_1.CustomError("Slot not found", constants_2.HTTP_STATUS.NOT_FOUND);
            }
            if (slot.status !== constants_1.SlotStatus.BOOKED) {
                throw new custom_error_1.CustomError("Slot is not booked", constants_2.HTTP_STATUS.BAD_REQUEST);
            }
            if (slot.videoCallStatus !== constants_1.VideoCallStatus.IN_PROGRESS) {
                throw new custom_error_1.CustomError("Video call has not started", constants_2.HTTP_STATUS.BAD_REQUEST);
            }
            if (role === "trainer" && slot.trainerId.toString() !== userId) {
                throw new custom_error_1.CustomError("Only the assigned trainer can join the call", constants_2.HTTP_STATUS.UNAUTHORIZED);
            }
            if (role === "client") {
                const client = yield this.clientRepository.findByClientNewId(userId);
                console.log(client, "client in join video call");
                if (!client || client.id !== slot.clientId || client.selectStatus !== constants_1.TrainerSelectionStatus.ACCEPTED) {
                    throw new custom_error_1.CustomError("Unauthorized client or invalid relationship", constants_2.HTTP_STATUS.UNAUTHORIZED);
                }
            }
            return slot;
        });
    }
};
exports.JoinVideoCallUseCase = JoinVideoCallUseCase;
exports.JoinVideoCallUseCase = JoinVideoCallUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], JoinVideoCallUseCase);
