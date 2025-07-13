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
exports.TrainerController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const update_validation_1 = require("@/shared/validations/update.validation");
const stripe_schema_1 = require("@/shared/validations/stripe.schema");
let TrainerController = class TrainerController {
    constructor(getAllUsersUseCase, updateUserStatusUseCase, trainerVerificationUseCase, updateTrainerProfileUseCase, changeTrainerPasswordUseCase, _createStripeConnectAccountUseCase, _getTrainerClientsUseCase, _trainerAcceptRejectRequestUseCase, _getPendingClientRequestsUseCase, _getTrainerWalletUseCase) {
        this.getAllUsersUseCase = getAllUsersUseCase;
        this.updateUserStatusUseCase = updateUserStatusUseCase;
        this.trainerVerificationUseCase = trainerVerificationUseCase;
        this.updateTrainerProfileUseCase = updateTrainerProfileUseCase;
        this.changeTrainerPasswordUseCase = changeTrainerPasswordUseCase;
        this._createStripeConnectAccountUseCase = _createStripeConnectAccountUseCase;
        this._getTrainerClientsUseCase = _getTrainerClientsUseCase;
        this._trainerAcceptRejectRequestUseCase = _trainerAcceptRejectRequestUseCase;
        this._getPendingClientRequestsUseCase = _getPendingClientRequestsUseCase;
        this._getTrainerWalletUseCase = _getTrainerWalletUseCase;
    }
    /** 🔹 Get all trainers with pagination and search */
    getAllTrainers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 5, search = "", userType } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                const userTypeString = typeof userType === "string" ? userType : "trainer";
                const searchTermString = typeof search === "string" ? search : "";
                const { user, total } = yield this.getAllUsersUseCase.execute(userTypeString, pageNumber, pageSize, searchTermString);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    user,
                    totalPages: total,
                    currentPage: pageNumber,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /** 🔹 Update trainer status (approve/reject) */
    updateUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId, status } = req.body;
                yield this.updateUserStatusUseCase.execute(trainerId, status);
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
    /** 🔹 Verify and approve/reject trainer */
    trainerVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, approvalStatus, rejectionReason } = req.body;
                if (!clientId || !approvalStatus) {
                    throw new custom_error_1.CustomError("Client ID and approval status are required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (![
                    constants_1.TrainerApprovalStatus.APPROVED,
                    constants_1.TrainerApprovalStatus.REJECTED,
                ].includes(approvalStatus)) {
                    throw new custom_error_1.CustomError("Invalid approval status", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this.trainerVerificationUseCase.execute(clientId, approvalStatus, rejectionReason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: `Trainer ${approvalStatus.toLowerCase()} successfully`,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    /** 🔹 Update trainer profile */
    updateTrainerProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.params.trainerId;
                const profileData = req.body;
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.ID_NOT_PROVIDED, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const validatedData = update_validation_1.trainerUpdateSchema.parse(profileData);
                const allowedFields = [
                    "firstName",
                    "lastName",
                    "phoneNumber",
                    "profileImage",
                    "height",
                    "weight",
                    "dateOfBirth",
                    "gender",
                    "experience",
                    "skills",
                    "qualifications",
                    "specialization",
                    "certifications",
                ];
                // Type the updates object explicitly
                const updates = {};
                for (const key of allowedFields) {
                    if (key in validatedData && validatedData[key] !== undefined) {
                        // Type-safe assignment
                        updates[key] = validatedData[key];
                    }
                }
                const updatedTrainer = yield this.updateTrainerProfileUseCase.execute(trainerId, updates);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS,
                    trainer: updatedTrainer,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.user.id;
                const { currentPassword, newPassword } = req.body;
                if (!id) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!currentPassword || !newPassword) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.CURRENT_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (currentPassword === newPassword) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.SAME_CURR_NEW_PASSWORD, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this.changeTrainerPasswordUseCase.execute(id, currentPassword, newPassword);
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
    createStripeConnectAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
                    });
                    return;
                }
                if (req.user.role !== "trainer" && req.user.role !== "admin") {
                    res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.NOT_ALLOWED,
                    });
                    return;
                }
                const validatedData = stripe_schema_1.createStripeConnectAccountSchema.parse(req.body);
                const { accountLinkUrl } = yield this._createStripeConnectAccountUseCase.execute(req.user.id, req.user.email, validatedData);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    url: accountLinkUrl,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTrainerClients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { user: clients, total } = yield this._getTrainerClientsUseCase.execute(trainerId, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    clients,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalClients: clients.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    acceptRejectClientRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { clientId, action, rejectionReason } = req.body;
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!clientId || !action) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!["accept", "reject"].includes(action)) {
                    throw new custom_error_1.CustomError("Invalid action", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedClient = yield this._trainerAcceptRejectRequestUseCase.execute(trainerId, clientId, action, rejectionReason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.TRAINER_REQUEST_UPDATED,
                    client: updatedClient,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getPendingClientRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { user: requests, total } = yield this._getPendingClientRequestsUseCase.execute(trainerId, pageNumber, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    requests,
                    totalPages: total,
                    currentPage: pageNumber,
                    totalRequests: requests.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getWalletHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { page = "1", limit = "10", status } = req.query;
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
                const statusFilter = typeof status === "string" &&
                    Object.values(constants_1.PaymentStatus).includes(status)
                    ? status
                    : undefined;
                if (isNaN(pageNumber) ||
                    isNaN(limitNumber) ||
                    pageNumber <= 0 ||
                    limitNumber <= 0) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this._getTrainerWalletUseCase.execute(trainerId, pageNumber, limitNumber);
                res.json({
                    success: true,
                    data: {
                        items,
                        total,
                        page: pageNumber,
                        limit: limitNumber,
                        totalPages: Math.ceil(total / limitNumber),
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.TrainerController = TrainerController;
exports.TrainerController = TrainerController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetAllUsersUseCase")),
    __param(1, (0, tsyringe_1.inject)("IUpdateUserStatusUseCase")),
    __param(2, (0, tsyringe_1.inject)("ITrainerVerificationUseCase")),
    __param(3, (0, tsyringe_1.inject)("IUpdateTrainerProfileUseCase")),
    __param(4, (0, tsyringe_1.inject)("IUpdateTrainerPasswordUseCase")),
    __param(5, (0, tsyringe_1.inject)("ICreateStripeConnectAccountUseCase")),
    __param(6, (0, tsyringe_1.inject)("IGetTrainerClientsUseCase")),
    __param(7, (0, tsyringe_1.inject)("ITrainerAcceptRejectRequestUseCase")),
    __param(8, (0, tsyringe_1.inject)("IGetPendingClientRequestsUseCase")),
    __param(9, (0, tsyringe_1.inject)("IGetTrainerWalletUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TrainerController);
