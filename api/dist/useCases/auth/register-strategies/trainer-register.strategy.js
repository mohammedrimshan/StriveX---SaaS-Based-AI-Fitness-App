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
exports.TrainerRegisterStrategy = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service"); // Add this
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const uniqueuid_bcrypt_1 = require("@/frameworks/security/uniqueuid.bcrypt");
const user_signup_validation_schema_1 = require("@/interfaceAdapters/controllers/auth/validations/user-signup.validation.schema");
let TrainerRegisterStrategy = class TrainerRegisterStrategy {
    constructor(_passwordBcrypt, _trainerRepository, _emailService, _adminRepository, _notificationService // Inject NotificationService
    ) {
        this._passwordBcrypt = _passwordBcrypt;
        this._trainerRepository = _trainerRepository;
        this._emailService = _emailService;
        this._adminRepository = _adminRepository;
        this._notificationService = _notificationService;
    }
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.role !== "trainer") {
                throw new custom_error_1.CustomError("Invalid role for user registration", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const validationResult = user_signup_validation_schema_1.trainerSchema.safeParse(user);
            if (!validationResult.success) {
                throw new custom_error_1.CustomError("Invalid input data", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { firstName, lastName, email, phoneNumber, password, dateOfBirth, gender, experience, skills, } = user;
            const existingTrainer = yield this._trainerRepository.findByEmail(email);
            let hashedPassword = password
                ? yield this._passwordBcrypt.hash(password)
                : "";
            const trainerData = {
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword,
                dateOfBirth,
                gender,
                experience,
                skills,
                role: "trainer",
                approvalStatus: constants_1.TrainerApprovalStatus.PENDING,
                rejectionReason: undefined,
                approvedByAdmin: false,
            };
            let savedTrainer;
            if (existingTrainer &&
                existingTrainer.approvalStatus === constants_1.TrainerApprovalStatus.REJECTED) {
                // Re-registration case
                savedTrainer = yield this._trainerRepository.updateByEmail(email, Object.assign(Object.assign({}, trainerData), { updatedAt: new Date() }));
                if (!savedTrainer) {
                    throw new custom_error_1.CustomError("Failed to update trainer data", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                // Send re-registration email
                const trainerName = `${firstName} ${lastName}`;
                yield this._emailService.sendEmail(email, "StriveX Trainer Re-registration Submitted", (0, constants_1.RE_REGISTRATION_MAIL_CONTENT)(trainerName));
            }
            else if (existingTrainer) {
                // Email already exists and not rejected
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.EMAIL_EXISTS, constants_1.HTTP_STATUS.CONFLICT);
            }
            else {
                // New registration
                const clientId = (0, uniqueuid_bcrypt_1.generateUniqueId)("trainer");
                savedTrainer = yield this._trainerRepository.save(Object.assign(Object.assign({}, trainerData), { clientId }));
            }
            if (!savedTrainer) {
                return null;
            }
            const { items: admins, total } = yield this._adminRepository.find({ role: "admin" }, 0, // skip 0 records
            1000 // fetch up to 1000 admins, adjust as needed
            );
            const notificationMessage = `Trainer ${firstName} ${lastName} has registered and requires approval.`;
            for (const admin of admins) {
                try {
                    yield this._notificationService.sendToUser(admin.id, "New Trainer Registration", notificationMessage, "INFO");
                }
                catch (err) {
                    console.error("Failed to send notification to admin", err);
                }
            }
            return savedTrainer;
        });
    }
};
exports.TrainerRegisterStrategy = TrainerRegisterStrategy;
exports.TrainerRegisterStrategy = TrainerRegisterStrategy = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IPasswordBcrypt")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IEmailService")),
    __param(3, (0, tsyringe_1.inject)("IAdminRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService // Inject NotificationService
    ])
], TrainerRegisterStrategy);
