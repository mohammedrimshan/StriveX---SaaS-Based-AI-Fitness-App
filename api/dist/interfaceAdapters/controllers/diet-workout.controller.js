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
exports.DietWorkoutController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const mongoose_1 = require("mongoose");
let DietWorkoutController = class DietWorkoutController {
    constructor(_addWorkoutUseCase, _deleteWorkoutUseCase, _toggleWorkoutStatusUseCase, _updateWorkoutUseCase, _getAllAdminWorkoutsUseCase, _getWorkoutByIdUseCase, _generateWorkoutPlanUseCase, _getWorkoutPlanUseCase, _generateDietPlanUseCase, _getDietPlanUseCase, _getWorkoutsByCategoryUseCase, _getWorkoutsUseCase, _recordProgressUseCase, _getUserProgressUseCase, _addExerciseUseCase, _updateExerciseUseCase, _deleteExerciseUseCase) {
        this._addWorkoutUseCase = _addWorkoutUseCase;
        this._deleteWorkoutUseCase = _deleteWorkoutUseCase;
        this._toggleWorkoutStatusUseCase = _toggleWorkoutStatusUseCase;
        this._updateWorkoutUseCase = _updateWorkoutUseCase;
        this._getAllAdminWorkoutsUseCase = _getAllAdminWorkoutsUseCase;
        this._getWorkoutByIdUseCase = _getWorkoutByIdUseCase;
        this._generateWorkoutPlanUseCase = _generateWorkoutPlanUseCase;
        this._getWorkoutPlanUseCase = _getWorkoutPlanUseCase;
        this._generateDietPlanUseCase = _generateDietPlanUseCase;
        this._getDietPlanUseCase = _getDietPlanUseCase;
        this._getWorkoutsByCategoryUseCase = _getWorkoutsByCategoryUseCase;
        this._getWorkoutsUseCase = _getWorkoutsUseCase;
        this._recordProgressUseCase = _recordProgressUseCase;
        this._getUserProgressUseCase = _getUserProgressUseCase;
        this._addExerciseUseCase = _addExerciseUseCase;
        this._updateExerciseUseCase = _updateExerciseUseCase;
        this._deleteExerciseUseCase = _deleteExerciseUseCase;
    }
    // From AdminController
    addWorkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const workoutData = req.body;
                // Validate required fields
                if (!workoutData.title || !workoutData.category || !workoutData.duration) {
                    throw new custom_error_1.CustomError("Title, category, and duration are required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!Array.isArray(workoutData.exercises) || workoutData.exercises.length === 0) {
                    throw new custom_error_1.CustomError("At least one exercise is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate each exercise
                for (const [index, exercise] of workoutData.exercises.entries()) {
                    if (!exercise.name || !exercise.description || !exercise.duration || !exercise.defaultRestDuration) {
                        throw new custom_error_1.CustomError(`Exercise at index ${index} is missing required fields (name, description, duration, defaultRestDuration)`, constants_1.HTTP_STATUS.BAD_REQUEST);
                    }
                    if (typeof exercise.videoUrl !== "string" || exercise.videoUrl.trim() === "") {
                        throw new custom_error_1.CustomError(`Exercise at index ${index} requires a valid video URL. Please provide a non-empty URL or upload a video.`, constants_1.HTTP_STATUS.BAD_REQUEST);
                    }
                }
                // Set defaults
                if (!workoutData.difficulty)
                    workoutData.difficulty = "Beginner";
                if (workoutData.isPremium === undefined)
                    workoutData.isPremium = false;
                // Validate category ID
                if (!mongoose_1.Types.ObjectId.isValid(workoutData.category)) {
                    throw new custom_error_1.CustomError("Invalid category ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                workoutData.category = workoutData.category.toString();
                // Validate video uploads
                const videos = ((_a = req.body.files) === null || _a === void 0 ? void 0 : _a.videos) && Array.isArray(req.body.files.videos) ? req.body.files.videos : [];
                if (videos.length > 0 && videos.length !== workoutData.exercises.length) {
                    throw new custom_error_1.CustomError("Number of uploaded videos must match number of exercises", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const files = {
                    image: (_b = req.body.files) === null || _b === void 0 ? void 0 : _b.image,
                    videos,
                };
                const createdWorkout = yield this._addWorkoutUseCase.execute(workoutData, files);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: "Workout created successfully",
                    data: createdWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    deleteWorkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId } = req.params;
                if (!workoutId)
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                const deleted = yield this._deleteWorkoutUseCase.execute(workoutId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: deleted ? "Workout deleted successfully" : "Workout not found",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    toggleWorkoutStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId } = req.params;
                if (!workoutId)
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                const updatedWorkout = yield this._toggleWorkoutStatusUseCase.execute(workoutId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Workout status updated successfully",
                    data: updatedWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateWorkout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId } = req.params;
                const workoutData = req.body;
                if (!workoutId)
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                if (workoutData.exercises && !Array.isArray(workoutData.exercises)) {
                    throw new custom_error_1.CustomError("Exercises must be an array", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (workoutData.category && !mongoose_1.Types.ObjectId.isValid(workoutData.category)) {
                    throw new custom_error_1.CustomError("Invalid category ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                console.log("Received payload:", req.body);
                const files = req.body.image ? { image: req.body.image } : undefined;
                const updatedWorkout = yield this._updateWorkoutUseCase.execute(workoutId, workoutData, files);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Workout updated successfully",
                    data: updatedWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllAdminWorkouts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, filter = "{}" } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                const filterObj = typeof filter === "string" ? JSON.parse(filter) : {};
                if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid page or limit parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const result = yield this._getAllAdminWorkoutsUseCase.execute(pageNumber, pageSize, filterObj);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    // From UserController
    generateWork(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const workoutPlan = yield this._generateWorkoutPlanUseCase.execute(userId);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    status: "success",
                    message: "Workout plan generated successfully",
                    data: workoutPlan,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getWorkouts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                if (!userId)
                    throw new custom_error_1.CustomError("ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                const workoutPlans = yield this._getWorkoutPlanUseCase.execute(userId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: workoutPlans,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getWorkoutsByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId } = req.params;
                if (!categoryId) {
                    throw new custom_error_1.CustomError("ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const workouts = yield this._getWorkoutsByCategoryUseCase.execute(categoryId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: workouts,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllWorkouts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "10", filter = "{}" } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                let filterObj = {};
                if (typeof filter === "string") {
                    try {
                        const parsed = JSON.parse(filter);
                        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
                            filterObj = parsed;
                        }
                        else {
                            console.warn("Filter must be an object, defaulting to {}:", filter);
                        }
                    }
                    catch (e) {
                        console.warn("Invalid filter JSON, defaulting to {}:", filter);
                    }
                }
                else if (filter && typeof filter === "object" && !Array.isArray(filter)) {
                    filterObj = filter;
                }
                else {
                    console.warn("Invalid filter type, defaulting to {}:", filter);
                }
                const workouts = yield this._getWorkoutsUseCase.execute(filterObj, pageNumber, limitNumber);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: workouts,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    recordProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const progressData = req.body;
                const recordedProgress = yield this._recordProgressUseCase.execute(progressData);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: "Progress recorded successfully",
                    data: recordedProgress,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getUserProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!userId) {
                    throw new custom_error_1.CustomError("ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const progress = yield this._getUserProgressUseCase.execute(userId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: progress,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    generateDiet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const dietPlan = yield this._generateDietPlanUseCase.execute(userId);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    status: "success",
                    message: "Diet plan generated successfully",
                    data: dietPlan,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getDietplan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                if (!userId)
                    throw new custom_error_1.CustomError("ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                const dietPlans = yield this._getDietPlanUseCase.execute(userId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: dietPlans,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    addExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId } = req.params;
                const exerciseData = req.body;
                if (!workoutId) {
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(workoutId)) {
                    throw new custom_error_1.CustomError("Invalid workout ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!exerciseData.name || !exerciseData.description || !exerciseData.duration || !exerciseData.defaultRestDuration) {
                    throw new custom_error_1.CustomError("Exercise missing required fields (name, description, duration, defaultRestDuration)", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updateWorkout = yield this._addExerciseUseCase.execute(workoutId, exerciseData);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: "Exercise added successfully",
                    data: updateWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId, exerciseId } = req.params;
                const exerciseData = req.body;
                if (!workoutId) {
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!exerciseId) {
                    throw new custom_error_1.CustomError("Exercise ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(workoutId) || !mongoose_1.Types.ObjectId.isValid(exerciseId)) {
                    throw new custom_error_1.CustomError("Invalid workout or exercise ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (Object.keys(exerciseData).length === 0) {
                    throw new custom_error_1.CustomError("No exercise data provided for update", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (exerciseData.videoUrl && (typeof exerciseData.videoUrl !== "string" || exerciseData.videoUrl.trim() === "")) {
                    throw new custom_error_1.CustomError("Video URL must be a non-empty string if provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedWorkout = yield this._updateExerciseUseCase.execute(workoutId, exerciseId, exerciseData);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Exercise updated successfully",
                    data: updatedWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    deleteExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId, exerciseId } = req.params;
                if (!workoutId) {
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!exerciseId) {
                    throw new custom_error_1.CustomError("Exercise ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(workoutId) || !mongoose_1.Types.ObjectId.isValid(exerciseId)) {
                    throw new custom_error_1.CustomError("Invalid workout or exercise ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedWorkout = yield this._deleteExerciseUseCase.execute(workoutId, exerciseId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Exercise deleted successfully",
                    data: updatedWorkout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getWorkoutById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workoutId } = req.params;
                if (!workoutId) {
                    throw new custom_error_1.CustomError("Workout ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const workout = yield this._getWorkoutByIdUseCase.execute(workoutId);
                if (!workout) {
                    throw new custom_error_1.CustomError("Workout not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Workout retrieved successfully",
                    data: workout,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.DietWorkoutController = DietWorkoutController;
exports.DietWorkoutController = DietWorkoutController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IAddWorkoutUseCase")),
    __param(1, (0, tsyringe_1.inject)("IDeleteWorkoutUseCase")),
    __param(2, (0, tsyringe_1.inject)("IToggleWorkoutStatusUseCase")),
    __param(3, (0, tsyringe_1.inject)("IUpdateWorkoutUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetAllAdminWorkoutsUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetWorkoutByIdUseCase")),
    __param(6, (0, tsyringe_1.inject)("IGenerateWorkoutPlanUseCase")),
    __param(7, (0, tsyringe_1.inject)("IGetWorkoutPlanUseCase")),
    __param(8, (0, tsyringe_1.inject)("IGenerateDietPlanUseCase")),
    __param(9, (0, tsyringe_1.inject)("IGetDietPlanUseCase")),
    __param(10, (0, tsyringe_1.inject)("IGetWorkoutsByCategoryUseCase")),
    __param(11, (0, tsyringe_1.inject)("IGetWorkoutsUseCase")),
    __param(12, (0, tsyringe_1.inject)("IRecordProgressUseCase")),
    __param(13, (0, tsyringe_1.inject)("IGetUserProgressUseCase")),
    __param(14, (0, tsyringe_1.inject)("IAddExerciseUseCase")),
    __param(15, (0, tsyringe_1.inject)("IUpdateExerciseUseCase")),
    __param(16, (0, tsyringe_1.inject)("IDeleteExerciseUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DietWorkoutController);
