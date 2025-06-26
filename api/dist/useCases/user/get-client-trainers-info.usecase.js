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
exports.GetClientTrainersInfoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetClientTrainersInfoUseCase = class GetClientTrainersInfoUseCase {
    constructor(clientRepository, trainerRepository) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const selectedTrainer = client.selectedTrainerId &&
                (yield this.trainerRepository.findById(client.selectedTrainerId));
            const backupTrainer = client.backupTrainerId &&
                (yield this.trainerRepository.findById(client.backupTrainerId));
            const mapTrainer = (trainer) => trainer
                ? {
                    id: trainer.id,
                    firstName: trainer.firstName,
                    lastName: trainer.lastName,
                    specialization: trainer.specialization,
                    profileImage: trainer.profileImage,
                    phoneNumber: trainer.phoneNumber,
                    email: trainer.email,
                    experience: trainer.experience,
                    gender: trainer.gender,
                }
                : null;
            return {
                selectedTrainer: mapTrainer(selectedTrainer),
                backupTrainer: mapTrainer(backupTrainer),
            };
        });
    }
};
exports.GetClientTrainersInfoUseCase = GetClientTrainersInfoUseCase;
exports.GetClientTrainersInfoUseCase = GetClientTrainersInfoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetClientTrainersInfoUseCase);
