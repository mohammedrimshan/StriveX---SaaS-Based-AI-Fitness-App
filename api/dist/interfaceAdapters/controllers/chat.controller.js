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
exports.ChatController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const socket_service_1 = require("@/interfaceAdapters/services/socket.service");
let ChatController = class ChatController {
    constructor(_getChatHistoryUseCase, _getRecentChatsUseCase, _getChatParticipantsUseCase, _validateChatPermissionsUseCase, _deleteMessageUseCase, _messageRepository, _socketService) {
        this._getChatHistoryUseCase = _getChatHistoryUseCase;
        this._getRecentChatsUseCase = _getRecentChatsUseCase;
        this._getChatParticipantsUseCase = _getChatParticipantsUseCase;
        this._validateChatPermissionsUseCase = _validateChatPermissionsUseCase;
        this._deleteMessageUseCase = _deleteMessageUseCase;
        this._messageRepository = _messageRepository;
        this._socketService = _socketService;
    }
    getChatHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { trainerId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!trainerId) {
                    throw new custom_error_1.CustomError("Trainer ID not provided", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._validateChatPermissionsUseCase.execute(userId, role, trainerId);
                const result = yield this._getChatHistoryUseCase.execute(role === constants_1.ROLES.USER ? userId : trainerId, role === constants_1.ROLES.USER ? trainerId : userId, page, limit);
                const messages = result.items.map((msg) => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    text: msg.content,
                    timestamp: msg.createdAt,
                    read: msg.status === "read",
                    media: msg.mediaUrl
                        ? {
                            type: msg.mediaType,
                            url: msg.mediaUrl,
                        }
                        : undefined,
                    replyToId: msg.replyToId,
                    reactions: msg.reactions || [],
                }));
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    messages,
                    total: result.total,
                    page,
                    limit,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getRecentChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const limit = parseInt(req.query.limit) || 10;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const chats = yield this._getRecentChatsUseCase.execute(userId, limit);
                const formattedChats = chats.map((chat) => ({
                    id: `${userId}_${chat.userId}`,
                    participants: [
                        {
                            id: chat.participants[0].id,
                            name: chat.participants[0].name || "Unknown",
                            avatar: chat.participants[0].avatar || "",
                            status: chat.participants[0].status || "offline",
                        },
                        {
                            id: chat.participants[1].id,
                            name: chat.participants[1].name || "Unknown",
                            avatar: chat.participants[1].avatar || "",
                            status: chat.participants[1].status || "offline",
                        },
                    ],
                    lastMessage: {
                        id: chat.lastMessage.id,
                        senderId: chat.lastMessage.senderId,
                        text: chat.lastMessage.content,
                        timestamp: chat.lastMessage.createdAt,
                        read: chat.lastMessage.status === "read",
                        media: chat.lastMessage.mediaUrl
                            ? {
                                type: chat.lastMessage.mediaType,
                                url: chat.lastMessage.mediaUrl,
                            }
                            : undefined,
                        replyToId: chat.lastMessage.replyToId,
                        reactions: chat.lastMessage.reactions || [],
                    },
                    unreadCount: chat.unreadCount,
                }));
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    chats: formattedChats,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getChatParticipants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                console.log(role, "role in getChatParticipants");
                console.log(userId, "userId in getChatParticipants");
                if (!userId || !role) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const participants = yield this._getChatParticipantsUseCase.execute(userId, role);
                console.log(participants, "participants in getChatParticipants");
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    participants,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { messageId } = req.params;
                console.log(messageId, "messageId in deleteMessage");
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (messageId.startsWith("temp-")) {
                    throw new custom_error_1.CustomError("Invalid message ID", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._deleteMessageUseCase.execute(messageId, userId);
                const message = yield this._messageRepository.findById(messageId);
                if (!message) {
                    throw new custom_error_1.CustomError("Message not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                const io = this._socketService.getIO();
                io.to(userId).emit("messageDeleted", { messageId });
                const receiverSocketId = (_b = this._socketService.getConnectedUser(message.receiverId)) === null || _b === void 0 ? void 0 : _b.socketId;
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("messageDeleted", { messageId });
                }
                res.status(constants_1.HTTP_STATUS.OK).json({ success: true });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetChatHistoryUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetRecentChatsUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetChatParticipantsUseCase")),
    __param(3, (0, tsyringe_1.inject)("IValidateChatPermissionsUseCase")),
    __param(4, (0, tsyringe_1.inject)("IDeleteMessageUseCase")),
    __param(5, (0, tsyringe_1.inject)("IMessageRepository")),
    __param(6, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, socket_service_1.SocketService])
], ChatController);
