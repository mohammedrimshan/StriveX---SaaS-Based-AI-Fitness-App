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
exports.UpdateTrainerProfileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let UpdateTrainerProfileUseCase = class UpdateTrainerProfileUseCase {
    constructor(_trainerRepository, _cloudinaryService) {
        this._trainerRepository = _trainerRepository;
        this._cloudinaryService = _cloudinaryService;
    }
    execute(trainerId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingTrainer = yield this._trainerRepository.findById(trainerId);
            if (!existingTrainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (data.profileImage && typeof data.profileImage === "string" && data.profileImage.startsWith("data:")) {
                const uploadResult = yield this._cloudinaryService.uploadImage(data.profileImage, {
                    folder: "trainer_profiles",
                    public_id: `trainer_${trainerId}_${Date.now()}`,
                });
                data.profileImage = uploadResult.secure_url;
            }
            if (data.certifications && Array.isArray(data.certifications)) {
                const uploadedCerts = [];
                for (const cert of data.certifications) {
                    if (typeof cert === "string" && cert.startsWith("data:")) {
                        const uploadResult = yield this._cloudinaryService.uploadFile(cert, {
                            folder: "trainer_certifications",
                            public_id: `cert_${trainerId}_${Date.now()}_${uploadedCerts.length}`,
                            resource_type: "auto",
                        });
                        uploadedCerts.push(uploadResult.secure_url);
                    }
                    else {
                        uploadedCerts.push(cert);
                    }
                }
                data.certifications = uploadedCerts;
            }
            const updatedTrainer = yield this._trainerRepository.findByIdAndUpdate(trainerId, data);
            if (!updatedTrainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_UPDATE, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return updatedTrainer;
        });
    }
};
exports.UpdateTrainerProfileUseCase = UpdateTrainerProfileUseCase;
exports.UpdateTrainerProfileUseCase = UpdateTrainerProfileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(1, (0, tsyringe_1.inject)("ICloudinaryService")),
    __metadata("design:paramtypes", [Object, Object])
], UpdateTrainerProfileUseCase);
