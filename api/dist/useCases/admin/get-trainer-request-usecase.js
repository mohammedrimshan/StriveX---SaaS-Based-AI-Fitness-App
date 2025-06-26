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
exports.GetTrainerRequestsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetTrainerRequestsUseCase = class GetTrainerRequestsUseCase {
    constructor(_clientRepository, _trainerRepository) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
    }
    execute(pageNumber, pageSize, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pageNumber < 1 || pageSize < 1) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VALIDATION_ERROR, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const filter = searchTerm
                ? {
                    $or: [
                        {
                            clientId: {
                                $regex: searchTerm,
                                $options: "i"
                            }
                        }
                    ]
                } : {};
            const { items: preferences, total } = yield this._clientRepository.find(filter, (pageNumber - 1) * pageSize, pageSize);
            const userData = yield Promise.all(preferences.map((pref) => __awaiter(this, void 0, void 0, function* () {
                const client = yield this._clientRepository.findByClientId(pref.clientId);
                const matchedTrainers = yield Promise.all((pref.matchedTrainers || []).map((trainerId) => __awaiter(this, void 0, void 0, function* () {
                    const trainer = yield this._trainerRepository.findById(trainerId);
                    return trainer ? { id: trainer.id, name: `${trainer.firstName} ${trainer.lastName}` } : null;
                }))).then(results => results.filter(t => t !== null));
                const selectedTrainer = pref.selectedTrainerId
                    ? yield this._trainerRepository.findById(pref.selectedTrainerId)
                    : null;
                return {
                    id: pref.id,
                    client: client ? `${client.firstName} ${client.lastName}` : "Unknown",
                    preferences: {
                        workoutType: pref.preferredWorkout,
                        fitnessGoal: pref.fitnessGoal,
                        skillLevel: pref.experienceLevel,
                        skillsToGain: pref.skillsToGain,
                    },
                    matchedTrainers,
                    selectedTrainer: selectedTrainer ? { id: selectedTrainer.id, name: `${selectedTrainer.firstName} ${selectedTrainer.lastName}` } : null,
                    status: pref.status,
                };
            })));
            return {
                user: userData,
                total: Math.ceil(total / pageSize),
            };
        });
    }
};
exports.GetTrainerRequestsUseCase = GetTrainerRequestsUseCase;
exports.GetTrainerRequestsUseCase = GetTrainerRequestsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetTrainerRequestsUseCase);
