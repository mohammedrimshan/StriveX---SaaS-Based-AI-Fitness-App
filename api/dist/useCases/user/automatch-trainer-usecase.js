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
exports.AutoMatchTrainerUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let AutoMatchTrainerUseCase = class AutoMatchTrainerUseCase {
    constructor(_clientRepository, _trainerRepository) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
    }
    execute(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this._clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.PREFERENCES_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (client.selectionMode !== "auto") {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_SELECTION_MODE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { items: trainers } = yield this._trainerRepository.find({ approvalStatus: constants_1.TrainerApprovalStatus.APPROVED }, 0, 100);
            if (!trainers.length) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.NO_MATCHING_TRAINERS, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const scoredTrainers = yield this._scoreAndRankTrainers(client, trainers);
            const topTrainers = scoredTrainers
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((item) => item.trainer.id)
                .filter((id) => typeof id === "string");
            if (!topTrainers.length) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.NO_MATCHING_TRAINERS, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updatedClient = yield this._clientRepository.update(clientId, {
                matchedTrainers: topTrainers,
                selectedTrainerId: topTrainers[0],
                selectStatus: constants_1.TrainerSelectionStatus.PENDING,
            });
            if (!updatedClient) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_UPDATE_PREFERENCES, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return updatedClient;
        });
    }
    _scoreAndRankTrainers(client, trainers) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(trainers.map((trainer) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const skillMatchCount = client.skillsToGain.filter((skill) => { var _a; return (_a = trainer.skills) === null || _a === void 0 ? void 0 : _a.includes(skill); }).length;
                const workoutMatch = ((_a = trainer.specialization) === null || _a === void 0 ? void 0 : _a.includes((_b = client.preferredWorkout) !== null && _b !== void 0 ? _b : ""))
                    ? 1
                    : 0;
                const clientCount = yield this._clientRepository
                    .find({
                    selectedTrainerId: trainer.id,
                    selectStatus: constants_1.TrainerSelectionStatus.ASSIGNED,
                }, 0, 0)
                    .then((res) => res.total);
                const score = skillMatchCount * 2 +
                    workoutMatch * 3 +
                    -clientCount * 0.5;
                return { trainer, score };
            })));
        });
    }
};
exports.AutoMatchTrainerUseCase = AutoMatchTrainerUseCase;
exports.AutoMatchTrainerUseCase = AutoMatchTrainerUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object])
], AutoMatchTrainerUseCase);
