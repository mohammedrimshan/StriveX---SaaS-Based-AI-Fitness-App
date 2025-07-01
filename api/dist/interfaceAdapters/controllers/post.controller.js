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
exports.PostController = void 0;
const tsyringe_1 = require("tsyringe");
const socket_service_1 = require("../services/socket.service");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const mongoose_1 = __importDefault(require("mongoose"));
let PostController = class PostController {
    constructor(_createPostUseCase, _getPostsUseCase, _getPostUseCase, _deletePostUseCase, _likePostUseCase, _reportPostUseCase, _socketService) {
        this._createPostUseCase = _createPostUseCase;
        this._getPostsUseCase = _getPostsUseCase;
        this._getPostUseCase = _getPostUseCase;
        this._deletePostUseCase = _deletePostUseCase;
        this._likePostUseCase = _likePostUseCase;
        this._reportPostUseCase = _reportPostUseCase;
        this._socketService = _socketService;
    }
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { textContent, mediaUrl } = req.body;
                if (!textContent)
                    throw new custom_error_1.CustomError("Post content is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                const post = yield this._createPostUseCase.execute({ textContent, mediaUrl }, req.user.id);
                // Fetch author details to include in the emitted post
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
                // Map to FrontendPost format
                const frontendPost = {
                    id: post.id,
                    authorId: post.authorId,
                    author,
                    role,
                    textContent: post.textContent,
                    mediaUrl: post.mediaUrl,
                    category: post.category,
                    likes: post.likes || [],
                    commentsCount: post.commentsCount || 0,
                    createdAt: post.createdAt.toISOString(),
                    isDeleted: post.isDeleted || false,
                };
                // Emit to community room
                const io = this._socketService.getIO();
                console.log(io, "IOCREATE");
                io.to("community").emit("newPost", frontendPost);
                res.status(constants_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    post,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, sortBy, skip = 0, limit = 10 } = req.query;
                const skipNumber = Number(skip);
                const limitNumber = Number(limit);
                if (isNaN(skipNumber) ||
                    isNaN(limitNumber) ||
                    skipNumber < 0 ||
                    limitNumber < 1) {
                    throw new custom_error_1.CustomError("Invalid skip or limit parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const posts = yield this._getPostsUseCase.execute({ category: category, sortBy: sortBy }, skipNumber, limitNumber);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    posts: posts.items,
                    totalPosts: posts.total,
                    currentSkip: skipNumber,
                    limit: limitNumber,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const post = yield this._getPostUseCase.execute(id);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    post,
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
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._deletePostUseCase.execute(id, req.user.id);
                const io = this._socketService.getIO();
                io.emit("postDeleted", { postId: id });
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DELETE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Unauthorized") {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: "Unauthorized to delete post",
                        error: "UNAUTHORIZED",
                    });
                    return;
                }
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    likePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.user.id;
                console.log(`LIKE POST: postId=${id}, userId=${userId}`);
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Like or unlike the post using the use case
                const post = yield this._likePostUseCase.execute(id, userId);
                if (!post) {
                    throw new custom_error_1.CustomError("Failed to like/unlike the post.", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                console.log(`POST:`, post);
                const io = this._socketService.getIO();
                // ✅ Wait briefly to ensure the "community" room has updated
                yield new Promise((resolve) => setTimeout(resolve, 300));
                const clients = yield io.in("community").allSockets();
                console.log(clients, "clients community");
                console.log(`[DEBUG] Emitting postLiked to ${clients.size} clients for post ${id}, userId=${userId}, likes:`, post.likes);
                if (clients.size > 0) {
                    io.to("community").emit("postLiked", {
                        postId: id,
                        userId: userId,
                        likes: Array.isArray(post.likes) ? post.likes : [],
                        hasLiked: post.likes.includes(userId),
                    });
                }
                else {
                    console.warn(`[WARN] No active clients in community room at emit time for post ${id}.`);
                }
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    data: post,
                });
            }
            catch (error) {
                console.error(`[DEBUG] likePost error:`, {
                    message: error.message,
                    stack: error.stack,
                });
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    reportPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { reason } = req.body;
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ID, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!reason)
                    throw new custom_error_1.CustomError("Report reason is required", constants_1.HTTP_STATUS.BAD_REQUEST);
                const post = yield this._reportPostUseCase.execute(id, req.user.id, reason);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.OPERATION_SUCCESS,
                    post,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.PostController = PostController;
exports.PostController = PostController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreatePostUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetPostsUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetPostUseCase")),
    __param(3, (0, tsyringe_1.inject)("IDeletePostUseCase")),
    __param(4, (0, tsyringe_1.inject)("ILikePostUseCase")),
    __param(5, (0, tsyringe_1.inject)("IReportPostUseCase")),
    __param(6, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, socket_service_1.SocketService])
], PostController);
