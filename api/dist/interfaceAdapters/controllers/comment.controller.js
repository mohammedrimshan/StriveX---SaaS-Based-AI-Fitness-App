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
exports.CommentController = void 0;
const tsyringe_1 = require("tsyringe");
const socket_service_1 = require("@/interfaceAdapters/services/socket.service");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const mongoose_1 = __importDefault(require("mongoose"));
let CommentController = class CommentController {
    constructor(_createCommentUseCase, _likeCommentUseCase, _deleteCommentUseCase, _reportCommentUseCase, _getCommentsUseCase, _socketService) {
        this._createCommentUseCase = _createCommentUseCase;
        this._likeCommentUseCase = _likeCommentUseCase;
        this._deleteCommentUseCase = _deleteCommentUseCase;
        this._reportCommentUseCase = _reportCommentUseCase;
        this._getCommentsUseCase = _getCommentsUseCase;
        this._socketService = _socketService;
    }
    createComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id: postId } = req.params;
                const { textContent } = req.body;
                if (!postId || !mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!textContent) {
                    throw new custom_error_1.CustomError("Comment content is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const comment = yield this._createCommentUseCase.execute({ textContent, postId }, req.user.id);
                let author = null;
                const role = req.user.role;
                if (role === "client") {
                    const client = yield this._socketService["_clientRepository"].findById(req.user.id);
                    if (client && client.id) {
                        author = {
                            _id: client.id.toString(),
                            firstName: client.firstName || "Unknown",
                            lastName: client.lastName || "",
                            email: client.email || "",
                            profileImage: client.profileImage || undefined,
                        };
                    }
                    else {
                        throw new custom_error_1.CustomError("Client not found", constants_1.HTTP_STATUS.NOT_FOUND);
                    }
                }
                else if (role === "trainer") {
                    const trainer = yield this._socketService["_trainerRepository"].findById(req.user.id);
                    if (trainer && trainer.id) {
                        author = {
                            _id: trainer.id.toString(),
                            firstName: trainer.firstName || "Unknown",
                            lastName: trainer.lastName || "",
                            email: trainer.email || "",
                            profileImage: trainer.profileImage || undefined,
                        };
                    }
                    else {
                        throw new custom_error_1.CustomError("Trainer not found", constants_1.HTTP_STATUS.NOT_FOUND);
                    }
                }
                else if (role === "admin") {
                    author = {
                        _id: req.user.id,
                        firstName: "Admin",
                        lastName: "",
                        email: "admin@example.com",
                        profileImage: undefined,
                    };
                }
                if (!author) {
                    throw new custom_error_1.CustomError("Failed to fetch author details", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                const frontendComment = {
                    id: (_a = comment.id) !== null && _a !== void 0 ? _a : "",
                    postId: comment.postId,
                    authorId: comment.authorId,
                    author,
                    textContent: comment.textContent,
                    likes: comment.likes || [],
                    isDeleted: comment.isDeleted || false,
                    createdAt: comment.createdAt.toISOString(),
                };
                const io = this._socketService.getIO();
                io.to("community").emit("newComment", frontendComment);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    comment,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Post not found") {
                    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                        success: false,
                        message: "Post not found",
                        error: "POST_NOT_FOUND",
                    });
                    return;
                }
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getComments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: postId } = req.params;
                const { page = "1", limit = "10" } = req.query;
                if (!postId || !mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);
                if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { items: comments, total } = yield this._getCommentsUseCase.execute(postId, pageNum, limitNum);
                const commentsWithAuthor = yield Promise.all(comments.map((comment) => __awaiter(this, void 0, void 0, function* () {
                    let author = null;
                    const role = comment.authorId
                        ? yield this._socketService.getUserRole(comment.authorId)
                        : null;
                    if (role === "client") {
                        const client = yield this._socketService["_clientRepository"].findById(comment.authorId);
                        if (client && client.id) {
                            author = {
                                _id: client.id.toString(),
                                firstName: client.firstName || "Unknown",
                                lastName: client.lastName || "",
                                email: client.email || "",
                                profileImage: client.profileImage || undefined,
                            };
                        }
                    }
                    else if (role === "trainer") {
                        const trainer = yield this._socketService["_trainerRepository"].findById(comment.authorId);
                        if (trainer && trainer.id) {
                            author = {
                                _id: trainer.id.toString(),
                                firstName: trainer.firstName || "Unknown",
                                lastName: trainer.lastName || "",
                                email: trainer.email || "",
                                profileImage: trainer.profileImage || undefined,
                            };
                        }
                    }
                    return Object.assign(Object.assign({}, comment), { author });
                })));
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    data: {
                        comments: commentsWithAuthor,
                        total,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(total / limitNum),
                    },
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Post not found") {
                    res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                        success: false,
                        message: "Post not found",
                        error: "POST_NOT_FOUND",
                    });
                    return;
                }
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    likeComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const comment = yield this._likeCommentUseCase.execute(id, req.user.id);
                if (comment.isDeleted) {
                    throw new custom_error_1.CustomError("Cannot like a deleted comment", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const io = this._socketService.getIO();
                io.to("community").emit("commentLiked", {
                    commentId: id,
                    userId: req.user.id,
                    likes: comment.likes || [],
                });
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    comment,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    deleteComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._deleteCommentUseCase.execute(id, req.user.id);
                const io = this._socketService.getIO();
                io.to("community").emit("commentDeleted", { commentId: id });
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DELETE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Unauthorized") {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: "Unauthorized to delete comment",
                        error: "UNAUTHORIZED",
                    });
                    return;
                }
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    reportComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { reason } = req.body;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!reason) {
                    throw new custom_error_1.CustomError("Report reason is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const comment = yield this._reportCommentUseCase.execute(id, req.user.id, reason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    comment,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.CommentController = CommentController;
exports.CommentController = CommentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateCommentUseCase")),
    __param(1, (0, tsyringe_1.inject)("ILikeCommentUseCase")),
    __param(2, (0, tsyringe_1.inject)("IDeleteCommentUseCase")),
    __param(3, (0, tsyringe_1.inject)("IReportCommentUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetCommentsUseCase")),
    __param(5, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, socket_service_1.SocketService])
], CommentController);
