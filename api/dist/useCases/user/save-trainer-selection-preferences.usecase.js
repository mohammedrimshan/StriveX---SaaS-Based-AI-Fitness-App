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
exports.SaveTrainerSelectionPreferencesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let SaveTrainerSelectionPreferencesUseCase = class SaveTrainerSelectionPreferencesUseCase {
    constructor(_clientRepository) {
        this._clientRepository = _clientRepository;
    }
    execute(clientId, preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { preferredWorkout, fitnessGoal, sleepFrom, wakeUpAt, experienceLevel, skillsToGain, selectionMode, } = preferences;
            if (!preferredWorkout || !constants_1.WORKOUT_TYPES.includes(preferredWorkout)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_WORKOUT_TYPE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!fitnessGoal || !constants_1.FITNESS_GOALS.includes(fitnessGoal)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.GOAL_NOT_FOUND, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!experienceLevel || !constants_1.EXPERIENCE_LEVELS.includes(experienceLevel)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VALIDATION_ERROR, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!skillsToGain ||
                !Array.isArray(skillsToGain) ||
                !skillsToGain.every((skill) => constants_1.SKILLS.includes(skill))) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_SKILL, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!selectionMode || !["auto", "manual"].includes(selectionMode)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VALIDATION_ERROR, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!sleepFrom || !wakeUpAt || !this.isValidTime(sleepFrom) || !this.isValidTime(wakeUpAt)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TIME_RANGE, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingClient = yield this._clientRepository.findById(clientId);
            if (!existingClient) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const updatedPreferences = yield this._clientRepository.update(clientId, {
                preferredWorkout,
                fitnessGoal,
                sleepFrom,
                wakeUpAt,
                experienceLevel,
                skillsToGain,
                selectionMode,
                selectStatus: constants_1.TrainerSelectionStatus.PENDING,
            });
            if (!updatedPreferences) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UPDATE_FAILED, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return updatedPreferences;
        });
    }
    isValidTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
};
exports.SaveTrainerSelectionPreferencesUseCase = SaveTrainerSelectionPreferencesUseCase;
exports.SaveTrainerSelectionPreferencesUseCase = SaveTrainerSelectionPreferencesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __metadata("design:paramtypes", [Object])
], SaveTrainerSelectionPreferencesUseCase);
