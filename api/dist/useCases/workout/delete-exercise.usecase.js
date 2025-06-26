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
exports.DeleteExerciseUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let DeleteExerciseUseCase = class DeleteExerciseUseCase {
    constructor(_workoutRepository) {
        this._workoutRepository = _workoutRepository;
    }
    execute(workoutId, exerciseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!workoutId || !exerciseId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_INPUT, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            try {
                const workout = yield this._workoutRepository.findById(workoutId);
                if (!workout) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.WORKOUT_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
                }
                const exerciseExists = workout.exercises.some((ex) => { var _a; return ((_a = ex._id) === null || _a === void 0 ? void 0 : _a.toString()) === exerciseId; });
                if (!exerciseExists) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.EXERCISE_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
                }
                const updatedWorkout = yield this._workoutRepository.deleteExercise(workoutId, exerciseId);
                if (!updatedWorkout) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_DELETE_EXERCISE, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                return updatedWorkout;
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    throw error;
                }
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_DELETE_EXERCISE, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.DeleteExerciseUseCase = DeleteExerciseUseCase;
exports.DeleteExerciseUseCase = DeleteExerciseUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWorkoutRepository")),
    __metadata("design:paramtypes", [Object])
], DeleteExerciseUseCase);
