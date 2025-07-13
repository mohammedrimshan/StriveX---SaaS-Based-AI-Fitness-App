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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const constants_1 = require("../../../shared/constants");
const tsyringe_1 = require("tsyringe");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const membership_plan_schema_1 = require("@/shared/validations/membership-plan.schema");
const mongoose_1 = __importDefault(require("mongoose"));
let AdminController = class AdminController {
    constructor(_membershipPlanRepository, _getTrainerRequestsUseCase, _updateTrainerRequestUseCase, _getReportedPostsUseCase, _getReportedCommentsUseCase, _hardDeletePostUseCase, _hardDeleteCommentUseCase, _getTransactionHistoryUseCase, _getUserSubscriptionsUseCase) {
        this._membershipPlanRepository = _membershipPlanRepository;
        this._getTrainerRequestsUseCase = _getTrainerRequestsUseCase;
        this._updateTrainerRequestUseCase = _updateTrainerRequestUseCase;
        this._getReportedPostsUseCase = _getReportedPostsUseCase;
        this._getReportedCommentsUseCase = _getReportedCommentsUseCase;
        this._hardDeletePostUseCase = _hardDeletePostUseCase;
        this._hardDeleteCommentUseCase = _hardDeleteCommentUseCase;
        this._getTransactionHistoryUseCase = _getTransactionHistoryUseCase;
        this._getUserSubscriptionsUseCase = _getUserSubscriptionsUseCase;
    }
    getMembershipPlans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, searchTerm = "" } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const filter = searchTerm
                    ? { name: { $regex: searchTerm, $options: "i" } }
                    : {};
                const { items: plans, total } = yield this._membershipPlanRepository.find(filter, (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    plans,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalPlans: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    createMembershipPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const validatedData = membership_plan_schema_1.createMembershipPlanSchema.parse(req.body);
                yield this._membershipPlanRepository.save({
                    name: validatedData.name,
                    durationMonths: validatedData.durationMonths,
                    price: validatedData.price,
                    isActive: (_a = validatedData.isActive) !== null && _a !== void 0 ? _a : true,
                });
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    updateMembershipPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { planId } = req.params;
                const validatedData = membership_plan_schema_1.updateMembershipPlanSchema.parse(req.body);
                if (!planId) {
                    throw new custom_error_1.CustomError("Plan ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const plan = yield this._membershipPlanRepository.findById(planId);
                if (!plan) {
                    throw new custom_error_1.CustomError("Membership plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                yield this._membershipPlanRepository.update(planId, validatedData);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    deleteMembershipPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { planId } = req.params;
                if (!planId) {
                    throw new custom_error_1.CustomError("Plan ID is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const deleted = yield this._membershipPlanRepository.delete(planId);
                if (!deleted) {
                    throw new custom_error_1.CustomError("Membership plan not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getTrainerRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search = "" } = req.query;
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                const searchTerm = typeof search === "string" ? search.trim() : "";
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { user: requests, total } = yield this._getTrainerRequestsUseCase.execute(pageNumber, pageSize, searchTerm);
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
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    updateTrainerRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, trainerId } = req.body;
                if (!clientId || !trainerId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.MISSING_PARAMETERS, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedRequest = yield this._updateTrainerRequestUseCase.execute(clientId, trainerId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.TRAINER_REQUEST_UPDATED,
                    request: updatedRequest,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getReportedPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield this._getReportedPostsUseCase.execute();
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    posts,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getReportedComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comments = yield this._getReportedCommentsUseCase.execute();
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    comments,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    hardDeletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._hardDeletePostUseCase.execute(id);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DELETE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    hardDeleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._hardDeleteCommentUseCase.execute(id);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DELETE_SUCCESS,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getTransactionHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, role, page = 1, limit = 10, search, status } = req.query;
                // Validate pagination
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate role if provided
                if (role && role !== "client" && role !== "trainer") {
                    throw new custom_error_1.CustomError("Role must be either 'client' or 'trainer'", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate userId if provided
                if (userId && (typeof userId !== "string" || userId.trim() === "")) {
                    throw new custom_error_1.CustomError("User ID must be a non-empty string", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate search if provided
                if (search && (typeof search !== "string" || search.trim() === "")) {
                    throw new custom_error_1.CustomError("Search must be a non-empty string", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate status if provided
                if (status &&
                    status !== "all" &&
                    status !== "completed" &&
                    status !== "pending") {
                    throw new custom_error_1.CustomError("Status must be 'all', 'completed', or 'pending'", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Execute the use case
                const { items: transactions, total } = yield this._getTransactionHistoryUseCase.execute({
                    userId,
                    role: role,
                    page: pageNumber,
                    limit: pageSize,
                    search: search,
                    status: status,
                });
                // Respond with the transaction history
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    transactions,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalTransactions: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getUserSubscriptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10, search, status } = req.query;
                // Validate pagination
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (isNaN(pageNumber) ||
                    isNaN(pageSize) ||
                    pageNumber < 1 ||
                    pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate search if provided
                if (search && (typeof search !== "string" || search.trim() === "")) {
                    throw new custom_error_1.CustomError("Search must be a non-empty string", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate status if provided
                if (status &&
                    status !== "all" &&
                    status !== "active" &&
                    status !== "expired") {
                    throw new custom_error_1.CustomError("Status must be 'all', 'active', or 'expired'", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Execute the use case
                const { items: subscriptions, total } = yield this._getUserSubscriptionsUseCase.execute({
                    page: pageNumber,
                    limit: pageSize,
                    search: search,
                    status: status,
                });
                // Respond with the subscription list
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    subscriptions,
                    totalPages: Math.ceil(total / pageSize),
                    currentPage: pageNumber,
                    totalSubscriptions: total,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(1, (0, tsyringe_1.inject)("IGetTrainerRequestsUseCase")),
    __param(2, (0, tsyringe_1.inject)("IUpdateTrainerRequestUseCase")),
    __param(3, (0, tsyringe_1.inject)("IGetReportedPostsUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetReportedCommentsUseCase")),
    __param(5, (0, tsyringe_1.inject)("IHardDeletePostUseCase")),
    __param(6, (0, tsyringe_1.inject)("IHardDeleteCommentUseCase")),
    __param(7, (0, tsyringe_1.inject)("IGetTransactionHistoryUseCase")),
    __param(8, (0, tsyringe_1.inject)("IGetUserSubscriptionsUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AdminController);
