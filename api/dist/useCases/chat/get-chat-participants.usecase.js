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
exports.GetChatParticipantsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetChatParticipantsUseCase = class GetChatParticipantsUseCase {
    constructor(_clientRepository, _trainerRepository) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
    }
    execute(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Object.values(constants_1.ROLES).includes(role)) {
                throw new custom_error_1.CustomError(`Invalid user role: ${role}`, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const participants = [];
            if (role === constants_1.ROLES.USER) {
                const client = yield this._clientRepository.findById(userId);
                if (!client)
                    throw new custom_error_1.CustomError("Client not found", constants_1.HTTP_STATUS.NOT_FOUND);
                if (!client.isPremium)
                    throw new custom_error_1.CustomError("Client is not a premium user", constants_1.HTTP_STATUS.FORBIDDEN);
                if (client.selectStatus !== constants_1.TrainerSelectionStatus.ACCEPTED) {
                    throw new custom_error_1.CustomError("Client does not have an assigned trainer", constants_1.HTTP_STATUS.FORBIDDEN);
                }
                if (!client.selectedTrainerId) {
                    throw new custom_error_1.CustomError("No trainer assigned to client", constants_1.HTTP_STATUS.FORBIDDEN);
                }
                const trainer = yield this._trainerRepository.findById(client.selectedTrainerId);
                if (!trainer)
                    throw new custom_error_1.CustomError("Assigned trainer not found", constants_1.HTTP_STATUS.NOT_FOUND);
                participants.push({
                    id: trainer.id,
                    name: `${trainer.firstName} ${trainer.lastName}`,
                    avatar: trainer.profileImage || "",
                    status: trainer.isOnline ? "online" : "offline",
                });
            }
            else if (role === constants_1.ROLES.TRAINER) {
                const trainer = yield this._trainerRepository.findById(userId);
                if (!trainer)
                    throw new custom_error_1.CustomError("Trainer not found", constants_1.HTTP_STATUS.NOT_FOUND);
                const { items: clients } = yield this._clientRepository.find({ selectedTrainerId: userId, selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED }, 0, 100);
                for (const client of clients) {
                    participants.push({
                        id: client.id,
                        name: `${client.firstName} ${client.lastName}`,
                        avatar: client.profileImage || "",
                        status: client.isOnline ? "online" : "offline",
                    });
                }
            }
            return participants;
        });
    }
};
exports.GetChatParticipantsUseCase = GetChatParticipantsUseCase;
exports.GetChatParticipantsUseCase = GetChatParticipantsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetChatParticipantsUseCase);
