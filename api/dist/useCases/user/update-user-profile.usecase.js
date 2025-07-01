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
exports.UpdateUserProfileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let UpdateUserProfileUseCase = class UpdateUserProfileUseCase {
    constructor(_clientRepository, _cloudinaryService, _clientProgressHistoryRepository) {
        this._clientRepository = _clientRepository;
        this._cloudinaryService = _cloudinaryService;
        this._clientProgressHistoryRepository = _clientProgressHistoryRepository;
    }
    execute(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const existingUser = yield this._clientRepository.findById(userId);
            if (!existingUser) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (data.healthConditions) {
                if (!Array.isArray(data.healthConditions)) {
                    throw new custom_error_1.CustomError("healthConditions must be an array", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                data.healthConditions = data.healthConditions.map((condition) => String(condition));
            }
            if (data.preferredWorkout) {
                if (!constants_1.WORKOUT_TYPES.includes(data.preferredWorkout)) {
                    throw new custom_error_1.CustomError("Invalid preferredWorkout type", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            if (data.waterIntakeTarget !== undefined) {
                if (typeof data.waterIntakeTarget !== "number" ||
                    data.waterIntakeTarget < 0) {
                    throw new custom_error_1.CustomError("waterIntakeTarget must be a non-negative number", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            if (data.weight !== undefined) {
                if (typeof data.weight !== "number" || data.weight <= 0) {
                    throw new custom_error_1.CustomError("weight must be a positive number", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            if (data.height !== undefined) {
                if (typeof data.height !== "number" || data.height <= 0) {
                    throw new custom_error_1.CustomError("height must be a positive number", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            if (data.profileImage &&
                typeof data.profileImage === "string" &&
                data.profileImage.startsWith("data:")) {
                try {
                    const uploadResult = yield this._cloudinaryService.uploadImage(data.profileImage, {
                        folder: "profile_images",
                        public_id: `user_${userId}_${Date.now()}`,
                    });
                    data.profileImage = uploadResult.secure_url;
                }
                catch (error) {
                    console.error("Cloudinary upload error:", error);
                    throw new custom_error_1.CustomError("Failed to upload profile image", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
            }
            const progressFields = {
                userId: new mongoose_1.Types.ObjectId(userId),
                date: new Date(),
            };
            let shouldSaveProgress = false;
            if (data.weight !== undefined) {
                progressFields.weight = data.weight;
                shouldSaveProgress = true;
            }
            if (data.height !== undefined) {
                progressFields.height = data.height;
                shouldSaveProgress = true;
            }
            if (data.waterIntake !== undefined) {
                progressFields.waterIntake = data.waterIntake;
                shouldSaveProgress = true;
            }
            if (data.waterIntakeTarget !== undefined) {
                progressFields.waterIntakeTarget = data.waterIntakeTarget;
                shouldSaveProgress = true;
            }
            if (shouldSaveProgress) {
                const latestProgress = yield this._clientProgressHistoryRepository.findLatestByUserId(userId);
                const hasChanges = (progressFields.weight !== undefined &&
                    progressFields.weight !== ((_a = latestProgress === null || latestProgress === void 0 ? void 0 : latestProgress.weight) !== null && _a !== void 0 ? _a : 0)) ||
                    (progressFields.height !== undefined &&
                        progressFields.height !== ((_b = latestProgress === null || latestProgress === void 0 ? void 0 : latestProgress.height) !== null && _b !== void 0 ? _b : 0)) ||
                    (progressFields.waterIntake !== undefined &&
                        progressFields.waterIntake !== ((_c = latestProgress === null || latestProgress === void 0 ? void 0 : latestProgress.waterIntake) !== null && _c !== void 0 ? _c : 0)) ||
                    (progressFields.waterIntakeTarget !== undefined &&
                        progressFields.waterIntakeTarget !==
                            ((_d = latestProgress === null || latestProgress === void 0 ? void 0 : latestProgress.waterIntakeTarget) !== null && _d !== void 0 ? _d : 0));
                if (!hasChanges && latestProgress) {
                    shouldSaveProgress = false;
                }
            }
            if (shouldSaveProgress) {
                try {
                    const savedProgress = yield this._clientProgressHistoryRepository.save(progressFields);
                }
                catch (error) {
                    console.error("Failed to save client progress history:", error);
                    throw new custom_error_1.CustomError("Failed to save progress history", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
            }
            else {
                console.log("No changes in progress fields, skipping save to ClientProgressHistory.");
            }
            const updatedUser = yield this._clientRepository.findByIdAndUpdate(userId, data);
            if (!updatedUser) {
                throw new custom_error_1.CustomError("Failed to update user profile", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return updatedUser;
        });
    }
};
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase;
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ICloudinaryService")),
    __param(2, (0, tsyringe_1.inject)("IClientProgressHistoryRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], UpdateUserProfileUseCase);
