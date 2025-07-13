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
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let UserController = class UserController {
    constructor(_getAllUsersUseCase, _updateUserStatusUseCase, _updateUserProfileUseCase, _changeUserPasswordUseCase, _getAllTrainersUseCase, _getTrainerProfileUseCase, _saveTrainerSelectionPreferencesUseCase, _autoMatchTrainerUseCase, _manualSelectTrainerUseCase, _getMatchedTrainersUseCase, selectTrainerFromMatchedListUseCase, getClientProfileUseCase, getClientTrainersInfoUseCase) {
        this._getAllUsersUseCase = _getAllUsersUseCase;
        this._updateUserStatusUseCase = _updateUserStatusUseCase;
        this._updateUserProfileUseCase = _updateUserProfileUseCase;
        this._changeUserPasswordUseCase = _changeUserPasswordUseCase;
        this._getAllTrainersUseCase = _getAllTrainersUseCase;
        this._getTrainerProfileUseCase = _getTrainerProfileUseCase;
        this._saveTrainerSelectionPreferencesUseCase = _saveTrainerSelectionPreferencesUseCase;
        this._autoMatchTrainerUseCase = _autoMatchTrainerUseCase;
        this._manualSelectTrainerUseCase = _manualSelectTrainerUseCase;
        this._getMatchedTrainersUseCase = _getMatchedTrainersUseCase;
        this.selectTrainerFromMatchedListUseCase = selectTrainerFromMatchedListUseCase;
        this.getClientProfileUseCase = getClientProfileUseCase;
        this.getClientTrainersInfoUseCase = getClientTrainersInfoUseCase;
    }
    // Get all users with pagination, search and filtering by user type
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "5", search = "", userType } = req.query;
                const pageNumber = parseInt(page, 10);
                const pageSize = parseInt(limit, 10);
                const userTypeString = typeof userType === "string" ? userType.toLowerCase() : "client";
                const searchTermString = typeof search === "string" ? search.trim() : "";
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VALIDATION_ERROR, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { user, total } = yield this._getAllUsersUseCase.execute(userTypeString, pageNumber, pageSize, searchTermString);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    users: user,
                    totalPages: total,
                    currentPage: pageNumber,
                    totalUsers: user.length === 0 ? 0 : (pageNumber - 1) * pageSize + user.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    // Update user status (active/blocked)
    updateUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userType, userId } = req.query;
                if (!userType || !userId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!["client", "trainer"].includes(userType.toLowerCase())) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ROLE, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._updateUserStatusUseCase.execute(userType.toLowerCase(), userId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    // Update user profile information
    updateUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const profileData = req.body;
                if (!userId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const allowedFields = [
                    "firstName",
                    "lastName",
                    "email",
                    "phoneNumber",
                    "profileImage",
                    "height",
                    "weight",
                    "fitnessGoal",
                    "preferredWorkout",
                    "experienceLevel",
                    "activityLevel",
                    "healthConditions",
                    "waterIntake",
                    "waterIntakeTarget",
                    "dietPreference",
                ];
                const updates = {};
                for (const key of allowedFields) {
                    if (profileData[key] !== undefined) {
                        if (key === "healthConditions" &&
                            typeof profileData[key] === "string") {
                            try {
                                updates[key] = JSON.parse(profileData[key]);
                                if (!Array.isArray(updates[key])) {
                                    throw new Error("healthConditions must be an array");
                                }
                            }
                            catch (e) {
                                throw new custom_error_1.CustomError("Invalid healthConditions format", constants_1.HTTP_STATUS.BAD_REQUEST);
                            }
                        }
                        else {
                            updates[key] = profileData[key];
                        }
                    }
                }
                const updatedUser = yield this._updateUserProfileUseCase.execute(userId, updates);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
                    user: updatedUser,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    // Change user password
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.user.id;
                const { currentPassword, newPassword } = req.body;
                if (!id) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!currentPassword || !newPassword) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_FIELDS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (currentPassword === newPassword) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._changeUserPasswordUseCase.execute(id, currentPassword, newPassword);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllTrainers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "5", search = "" } = req.query;
                const pageNumber = parseInt(page, 10);
                const pageSize = parseInt(limit, 10);
                const searchTermString = typeof search === "string" ? search.trim() : "";
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.VALIDATION_ERROR, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { trainers, total } = yield this._getAllTrainersUseCase.execute(pageNumber, pageSize, searchTermString);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    trainers,
                    totalPages: total,
                    currentPage: pageNumber,
                    totalTrainers: trainers.length === 0
                        ? 0
                        : (pageNumber - 1) * pageSize + trainers.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    // Get trainer profile by ID
    getTrainerProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { clientId } = req.query;
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const profile = yield this._getTrainerProfileUseCase.execute(trainerId, clientId);
                if (!profile) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
                }
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Trainer profile retrieved successfully",
                    data: profile,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /**
     * Saves trainer selection preferences (skills, goals, etc.)
     */
    saveTrainerSelectionPreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const preferences = req.body;
                if (!preferences.skillsToGain || !preferences.selectionMode) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const savedPreferences = yield this._saveTrainerSelectionPreferencesUseCase.execute(clientId, preferences);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.TRAINER_SELECTION_SAVED,
                    data: savedPreferences,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /**
     * Automatically matches trainers based on client preferences
     */
    autoMatchTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const result = yield this._autoMatchTrainerUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.TRAINER_ASSIGNED,
                    data: {
                        matchedTrainers: result.matchedTrainers,
                        selectedTrainer: result.selectedTrainerId,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /**
     * Manually selects a trainer
     */
    manualSelectTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { trainerId } = req.body;
                if (!clientId || !trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const result = yield this._manualSelectTrainerUseCase.execute(clientId, trainerId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.TRAINER_ASSIGNED,
                    data: {
                        selectedTrainer: result.selectedTrainerId,
                        status: result.selectStatus,
                        preferences: result,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getMatchedTrainers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const trainers = yield this._getMatchedTrainersUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    data: trainers,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /**
     * Controller to handle client trainer selection from matched list
     */
    selectTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { selectedTrainerId } = req.body;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!selectedTrainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const result = yield this.selectTrainerFromMatchedListUseCase.execute(clientId, selectedTrainerId);
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
    getClientProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.params.clientId;
                if (!clientId) {
                    throw new custom_error_1.CustomError("Client ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const profile = yield this.getClientProfileUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    profile,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getClientTrainerInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const result = yield this.getClientTrainersInfoUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: result,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetAllUsersUseCase")),
    __param(1, (0, tsyringe_1.inject)("IUpdateUserStatusUseCase")),
    __param(2, (0, tsyringe_1.inject)("IUpdateUserProfileUseCase")),
    __param(3, (0, tsyringe_1.inject)("IUpdateClientPasswordUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetAllTrainersUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetTrainerProfileUseCase")),
    __param(6, (0, tsyringe_1.inject)("ISaveTrainerSelectionPreferencesUseCase")),
    __param(7, (0, tsyringe_1.inject)("IAutoMatchTrainerUseCase")),
    __param(8, (0, tsyringe_1.inject)("IManualSelectTrainerUseCase")),
    __param(9, (0, tsyringe_1.inject)("IGetMatchedTrainersUseCase")),
    __param(10, (0, tsyringe_1.inject)("ISelectTrainerFromMatchedListUseCase")),
    __param(11, (0, tsyringe_1.inject)("IGetClientProfileUseCase")),
    __param(12, (0, tsyringe_1.inject)("IGetClientTrainersInfoUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserController);
