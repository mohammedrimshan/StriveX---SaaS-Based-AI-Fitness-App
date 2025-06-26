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
exports.AddWorkoutUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let AddWorkoutUseCase = class AddWorkoutUseCase {
    constructor(_workoutRepository, _cloudinaryService) {
        this._workoutRepository = _workoutRepository;
        this._cloudinaryService = _cloudinaryService;
    }
    execute(workoutData, files) {
        return __awaiter(this, void 0, void 0, function* () {
            let imageUrl = workoutData.imageUrl;
            try {
                if (files === null || files === void 0 ? void 0 : files.image) {
                    const imageResult = yield this._cloudinaryService.uploadImage(files.image, {
                        folder: "workouts/images",
                    });
                    imageUrl = imageResult.secure_url;
                }
                let updatedExercises = [...workoutData.exercises];
                if ((files === null || files === void 0 ? void 0 : files.videos) && Array.isArray(files.videos) && files.videos.length > 0) {
                    if (files.videos.length !== workoutData.exercises.length) {
                        throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_VIDEO_COUNT, constants_1.HTTP_STATUS.BAD_REQUEST);
                    }
                    const videoUploads = files.videos.map((video, index) => this._cloudinaryService.uploadFile(video, {
                        folder: "exercises/videos",
                    }).catch((err) => {
                        throw new custom_error_1.CustomError(`Failed to upload video for exercise ${index}: ${err.message}`, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                    }));
                    const videoResults = yield Promise.all(videoUploads);
                    updatedExercises = workoutData.exercises.map((exercise, index) => {
                        var _a;
                        const videoUrl = (_a = videoResults[index]) === null || _a === void 0 ? void 0 : _a.secure_url;
                        if (!videoUrl) {
                            throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VIDEO_UPLOAD_FAILED(index), constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                        }
                        return Object.assign(Object.assign({}, exercise), { videoUrl });
                    });
                }
                else {
                    updatedExercises = workoutData.exercises.map((exercise, index) => {
                        if (!exercise.videoUrl || exercise.videoUrl.trim() === "") {
                            throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.EXERCISE_MISSING_VIDEO_URL(index), constants_1.HTTP_STATUS.BAD_REQUEST);
                        }
                        return exercise;
                    });
                }
                const workoutWithFiles = Object.assign(Object.assign({}, workoutData), { imageUrl, exercises: updatedExercises });
                const createdWorkout = yield this._workoutRepository.save(workoutWithFiles);
                return createdWorkout;
            }
            catch (error) {
                throw new custom_error_1.CustomError(error instanceof Error ? error.message : constants_1.ERROR_MESSAGES.CREATE_WORKOUT_FAILED, error instanceof custom_error_1.CustomError ? error.statusCode : constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.AddWorkoutUseCase = AddWorkoutUseCase;
exports.AddWorkoutUseCase = AddWorkoutUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IWorkoutRepository")),
    __param(1, (0, tsyringe_1.inject)("ICloudinaryService")),
    __metadata("design:paramtypes", [Object, Object])
], AddWorkoutUseCase);
