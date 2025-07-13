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
exports.BackupTrainerController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let BackupTrainerController = class BackupTrainerController {
    constructor(assignBackupTrainerUseCase, acceptRejectInvitationUseCase, requestBackupTrainerChangeUseCase, resolveChangeRequestUseCase, getClientBackupTrainerUseCase, getTrainerBackupInvitationsUseCase, getTrainerBackupClientsUseCase, getPendingChangeRequestsUseCase, getClientChangeRequestsUseCase, getClientBackupInvitationsUseCase, getAllChangeRequestsUseCase, getClientsBackupOverviewUseCase) {
        this.assignBackupTrainerUseCase = assignBackupTrainerUseCase;
        this.acceptRejectInvitationUseCase = acceptRejectInvitationUseCase;
        this.requestBackupTrainerChangeUseCase = requestBackupTrainerChangeUseCase;
        this.resolveChangeRequestUseCase = resolveChangeRequestUseCase;
        this.getClientBackupTrainerUseCase = getClientBackupTrainerUseCase;
        this.getTrainerBackupInvitationsUseCase = getTrainerBackupInvitationsUseCase;
        this.getTrainerBackupClientsUseCase = getTrainerBackupClientsUseCase;
        this.getPendingChangeRequestsUseCase = getPendingChangeRequestsUseCase;
        this.getClientChangeRequestsUseCase = getClientChangeRequestsUseCase;
        this.getClientBackupInvitationsUseCase = getClientBackupInvitationsUseCase;
        this.getAllChangeRequestsUseCase = getAllChangeRequestsUseCase;
        this.getClientsBackupOverviewUseCase = getClientsBackupOverviewUseCase;
    }
    assignBackupTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const client = yield this.assignBackupTrainerUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.BACKUP_TRAINER_ASSIGNMENT_INITIATED,
                    client,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    acceptRejectBackupInvitation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trainerId = req.user.id;
                const { invitationId, action } = req.body;
                if (!trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!invitationId || !["accept", "reject"].includes(action)) {
                    throw new custom_error_1.CustomError("Invalid invitation ID or action", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const client = yield this.acceptRejectInvitationUseCase.execute(invitationId, trainerId, action);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.BACKUP_INVITATION_UPDATED,
                    client,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    requestBackupTrainerChange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { requestType, reason } = req.body;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!["CHANGE", "REVOKE"].includes(requestType)) {
                    throw new custom_error_1.CustomError("Invalid request type", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const request = yield this.requestBackupTrainerChangeUseCase.execute(clientId, requestType, reason);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.REQUEST_SUBMITTED,
                    request,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    resolveChangeRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = req.user.id;
                const { requestId, action } = req.body;
                if (!adminId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!requestId || !["approve", "reject"].includes(action)) {
                    throw new custom_error_1.CustomError("Invalid request ID or action", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const request = yield this.resolveChangeRequestUseCase.execute(requestId, adminId, action);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.REQUEST_RESOLVED,
                    request,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getClientBackupTrainer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.clientId;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const client = yield this.getClientBackupTrainerUseCase.execute(clientId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    client,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTrainerBackupInvitations(req, res) {
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
                const { items, total } = yield this.getTrainerBackupInvitationsUseCase.execute(trainerId, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    invitations: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalInvitations: items.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTrainerBackupClients(req, res) {
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
                const { items, total } = yield this.getTrainerBackupClientsUseCase.execute(trainerId, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    clients: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalClients: items.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getPendingChangeRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!adminId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this.getPendingChangeRequestsUseCase.execute((pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    requests: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalRequests: items.length,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getClientChangeRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this.getClientChangeRequestsUseCase.execute(clientId, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    requests: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalRequests: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getClientBackupInvitations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this.getClientBackupInvitationsUseCase.execute(clientId, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    invitations: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalInvitations: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllChangeRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = req.user.id;
                const { page = 1, limit = 10, status } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!adminId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this.getAllChangeRequestsUseCase.execute((pageNumber - 1) * pageSize, pageSize, status);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    requests: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalRequests: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getClientsBackupOverview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = req.user.id;
                const { page = 1, limit = 10 } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (!adminId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items, total } = yield this.getClientsBackupOverviewUseCase.execute((pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    clients: items,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalClients: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.BackupTrainerController = BackupTrainerController;
exports.BackupTrainerController = BackupTrainerController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IAssignBackupTrainerUseCase")),
    __param(1, (0, tsyringe_1.inject)("IAcceptRejectBackupInvitationUseCase")),
    __param(2, (0, tsyringe_1.inject)("IRequestBackupTrainerChangeUseCase")),
    __param(3, (0, tsyringe_1.inject)("IResolveBackupTrainerChangeRequestUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetClientBackupTrainerUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetTrainerBackupInvitationsUseCase")),
    __param(6, (0, tsyringe_1.inject)("IGetTrainerBackupClientsUseCase")),
    __param(7, (0, tsyringe_1.inject)("IGetPendingChangeRequestsUseCase")),
    __param(8, (0, tsyringe_1.inject)("IGetClientChangeRequestsUseCase")),
    __param(9, (0, tsyringe_1.inject)("IGetClientBackupInvitationsUseCase")),
    __param(10, (0, tsyringe_1.inject)("IGetAllChangeRequestsUseCase")),
    __param(11, (0, tsyringe_1.inject)("IGetClientsBackupOverviewUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BackupTrainerController);
