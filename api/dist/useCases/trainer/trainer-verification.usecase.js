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
exports.TrainerVerificationUseCase = void 0;
// api\src\useCases\trainer\trainer-verification.usecase.ts
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_2 = require("@/shared/constants");
let TrainerVerificationUseCase = class TrainerVerificationUseCase {
    constructor(_trainerRepository, _emailService) {
        this._trainerRepository = _trainerRepository;
        this._emailService = _emailService;
    }
    execute(clientId, approvalStatus, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this._trainerRepository.findById(clientId);
            if (!trainer) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (trainer.approvalStatus !== constants_2.TrainerApprovalStatus.PENDING) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_ALREADY_APPROVED_OR_REJECTED, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (![constants_2.TrainerApprovalStatus.APPROVED, constants_2.TrainerApprovalStatus.REJECTED].includes(approvalStatus)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ACTION, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (approvalStatus === constants_2.TrainerApprovalStatus.REJECTED && !rejectionReason) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.REJECTION_REASON_REQUIRED, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const approvedByAdmin = approvalStatus === constants_2.TrainerApprovalStatus.APPROVED ? true : false;
            yield this._trainerRepository.updateApprovalStatus(clientId, approvalStatus, rejectionReason, approvedByAdmin);
            const trainerName = `${trainer.firstName} ${trainer.lastName}`;
            if (approvalStatus === constants_2.TrainerApprovalStatus.APPROVED) {
                yield this._emailService.sendEmail(trainer.email, "Your StriveX Trainer Application Has Been Approved", (0, constants_2.APPROVAL_MAIL_CONTENT)(trainerName));
            }
            else if (approvalStatus === constants_2.TrainerApprovalStatus.REJECTED) {
                yield this._emailService.sendEmail(trainer.email, "Update on Your StriveX Trainer Application", (0, constants_2.REJECTION_MAIL_CONTENT)(trainerName, rejectionReason));
            }
        });
    }
};
exports.TrainerVerificationUseCase = TrainerVerificationUseCase;
exports.TrainerVerificationUseCase = TrainerVerificationUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(1, (0, tsyringe_1.inject)("IEmailService")),
    __metadata("design:paramtypes", [Object, Object])
], TrainerVerificationUseCase);
