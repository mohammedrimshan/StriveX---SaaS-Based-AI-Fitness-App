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
exports.UpdateWorkoutUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let UpdateWorkoutUseCase = class UpdateWorkoutUseCase {
    constructor(workoutRepository, cloudinaryService) {
        this._workoutRepository = workoutRepository;
        this._cloudinaryService = cloudinaryService;
    }
    execute(id, workoutData, files) {
        return __awaiter(this, void 0, void 0, function* () {
            const workout = yield this._workoutRepository.findById(id);
            if (!workout) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.WORKOUT_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            let imageUrl = workout.imageUrl;
            try {
                if (files === null || files === void 0 ? void 0 : files.image) {
                    const imageResult = yield this._cloudinaryService.uploadImage(files.image, {
                        folder: "workouts/images",
                    });
                    imageUrl = imageResult.secure_url;
                }
                else if (workoutData.imageUrl !== undefined) {
                    imageUrl = workoutData.imageUrl;
                }
                const updatedData = Object.assign(Object.assign({}, workoutData), { imageUrl });
                const updatedWorkout = yield this._workoutRepository.update(id, updatedData);
                if (!updatedWorkout) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.WORKOUT_UPDATE_FAILED, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                return updatedWorkout;
            }
            catch (error) {
                throw new custom_error_1.CustomError(error instanceof Error ? error.message : constants_1.ERROR_MESSAGES.WORKOUT_UPDATE_FAILED, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.UpdateWorkoutUseCase = UpdateWorkoutUseCase;
exports.UpdateWorkoutUseCase = UpdateWorkoutUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWorkoutRepository")),
    __param(1, (0, tsyringe_1.inject)("ICloudinaryService")),
    __metadata("design:paramtypes", [Object, Object])
], UpdateWorkoutUseCase);
