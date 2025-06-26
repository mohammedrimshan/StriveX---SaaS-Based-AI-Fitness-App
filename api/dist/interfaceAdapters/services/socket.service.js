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
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const constants_1 = require("@/shared/constants");
const uuid_1 = require("uuid");
let SocketService = class SocketService {
    constructor(_messageRepository, _commentRepository, _postRepository, _clientRepository, _trainerRepository, _likePostUseCase, _notificationService, _jwtService) {
        this._messageRepository = _messageRepository;
        this._commentRepository = _commentRepository;
        this._postRepository = _postRepository;
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._likePostUseCase = _likePostUseCase;
        this._notificationService = _notificationService;
        this._jwtService = _jwtService;
        this.connectedUsers = new Map();
        this.idMapping = new Map();
        this.userSocketMap = new Map();
        this.io = new socket_io_1.Server({
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true,
            },
            pingTimeout: 120000,
            pingInterval: 25000,
        });
    }
    isValidRole(role) {
        return ["client", "trainer"].includes(role);
    }
    initialize(server) {
        this.io.attach(server);
        this.io.on("connection", (socket) => {
            const cookie = socket.handshake.headers.cookie;
            let accessToken;
            if (cookie) {
                const cookies = cookie.split("; ").reduce((acc, curr) => {
                    const [key, value] = curr.split("=");
                    acc[key] = value;
                    return acc;
                }, {});
                accessToken = cookies[`${socket.handshake.auth.role}_access_token`];
            }
            // Map userId to socketIds
            const { userId } = socket.handshake.auth;
            if (userId) {
                if (!this.userSocketMap.has(userId)) {
                    this.userSocketMap.set(userId, new Set());
                }
                this.userSocketMap.get(userId).add(socket.id);
                console.log(`[${new Date().toISOString()}] Socket ${socket.id} mapped to user ${userId}, total sockets: ${this.userSocketMap.get(userId).size}`);
            }
            socket.on("reconnect", () => __awaiter(this, void 0, void 0, function* () {
                if (socket.userId && socket.role) {
                    socket.join("community");
                }
            }));
            socket.on("joinUserRoom", ({ userId }) => {
                socket.join(`user:${userId}`);
                console.log(`[${new Date().toISOString()}] User ${userId} joined user:${userId} via joinUserRoom`);
            });
            socket.on("joinNotificationsRoom", ({ userId }) => {
                socket.join(`notifications:${userId}`);
                console.log(`[${new Date().toISOString()}] User ${userId} joined notifications:${userId}`);
            });
            socket.on("register", (_a) => __awaiter(this, [_a], void 0, function* ({ userId, role }) {
                if (!userId || !this.isValidRole(role) || !accessToken) {
                    socket.emit("error", { message: "Invalid user ID or role" });
                    socket.disconnect();
                    return;
                }
                const decoded = this._jwtService.verifyAccessToken(accessToken);
                console.log(decoded, "Decoded JWT payload");
                if (!decoded || (decoded === null || decoded === void 0 ? void 0 : decoded.role) !== role) {
                    console.error(`[${new Date().toISOString()}] Token verification failed`, { userId, role, decoded });
                    socket.emit("error", { message: "Token validation failed" });
                    socket.disconnect();
                    return;
                }
                let userExists = false;
                let standardizedUserId = userId;
                try {
                    if (role === "client") {
                        const client = (yield this._clientRepository.findById(userId)) ||
                            (yield this._clientRepository.findByClientId(userId));
                        if (client && client.id) {
                            userExists = true;
                            standardizedUserId = client.id.toString();
                            if (client.id !== userId) {
                                this.idMapping.set(client.id.toString(), userId);
                            }
                            if (client.clientId && client.clientId !== userId) {
                                this.idMapping.set(client.clientId, userId);
                            }
                            if (userId.startsWith("striveX-client-")) {
                                const mongoId = client.id.toString();
                                this.idMapping.set(mongoId, userId);
                            }
                            yield this._clientRepository.findByIdAndUpdate(client.id, {
                                isOnline: true,
                            });
                        }
                    }
                    else if (role === "trainer") {
                        const trainer = yield this._trainerRepository.findById(userId);
                        if (trainer && trainer.id) {
                            userExists = true;
                            standardizedUserId = trainer.id.toString();
                            if (trainer.id !== userId) {
                                this.idMapping.set(trainer.id.toString(), userId);
                            }
                            if (trainer.clientId && trainer.clientId !== userId) {
                                this.idMapping.set(trainer.clientId, userId);
                            }
                            yield this._trainerRepository.findByIdAndUpdate(trainer.id, {
                                isOnline: true,
                            });
                        }
                    }
                }
                catch (error) {
                    socket.emit("error", { message: "Error during authentication" });
                    socket.disconnect();
                    return;
                }
                if (!userExists) {
                    socket.emit("error", { message: "User not found in database" });
                    socket.disconnect();
                    return;
                }
                socket.userId = standardizedUserId;
                socket.role = role;
                this.connectedUsers.set(standardizedUserId, {
                    socketId: socket.id,
                    userId: userId,
                    role,
                });
                yield this.notifyUserStatus(standardizedUserId, role, true);
                this.logTrainerClientConnection(standardizedUserId, role);
                socket.join("community");
                socket.emit("joinCommunity", { userId });
                socket.join(`user:${userId}`);
                socket.join(`notifications:${userId}`);
                console.log(`[${new Date().toISOString()}] User ${userId} joined rooms: user:${userId}, notifications:${userId}`);
                const rooms = Array.from(socket.rooms);
                console.log(`[${new Date().toISOString()}] User ${userId} rooms:`, rooms);
                const clientsInCommunity = yield this.io.in("community").allSockets();
                console.log(`[DEBUG] User ${userId} joined community room. Clients in room: ${clientsInCommunity.size}`);
                this.idMapping.set(userId, socket.id);
                socket.emit("registerSuccess", { userId });
                console.log(`[DEBUG] Registered user: ${userId}, role: ${role}, socket: ${socket.id}`);
                try {
                    const posts = yield this._postRepository.find({ isDeleted: false }, 0, 100);
                    const frontendPosts = posts.items.map((post) => this.mapToFrontendPost(post));
                    socket.emit("posts", frontendPosts);
                }
                catch (error) {
                    socket.emit("error", { message: "Failed to fetch initial posts" });
                }
            }));
            socket.on("joinCommunity", (_a) => __awaiter(this, [_a], void 0, function* ({ userId }) {
                if (!socket.userId || socket.userId !== userId) {
                    socket.emit("error", { message: "Unauthorized to join community" });
                    return;
                }
                socket.join("community");
                socket.emit("joinCommunity", { userId });
            }));
            socket.on("createPost", (data) => __awaiter(this, void 0, void 0, function* () {
                if (!socket.userId || !socket.role) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                if (data.role !== socket.role || !this.isValidRole(data.role)) {
                    socket.emit("error", { message: "Role mismatch or invalid role" });
                    return;
                }
                try {
                    const { senderId, textContent, media, category, role } = data;
                    if (!textContent && !media) {
                        socket.emit("error", { message: "Text or media is required" });
                        return;
                    }
                    if (!category) {
                        socket.emit("error", { message: "Category is required" });
                        return;
                    }
                    if (!constants_1.WORKOUT_TYPES.includes(category)) {
                        socket.emit("error", {
                            message: `Category must be one of: ${constants_1.WORKOUT_TYPES.join(", ")}`,
                        });
                        return;
                    }
                    const mediaUrl = media === null || media === void 0 ? void 0 : media.url;
                    let author = null;
                    if (role === "client") {
                        const client = (yield this._clientRepository.findById(senderId)) ||
                            (yield this._clientRepository.findByClientId(senderId));
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
                            socket.emit("error", {
                                message: "Client not found or invalid",
                            });
                            return;
                        }
                    }
                    else if (role === "trainer") {
                        const trainer = yield this._trainerRepository.findById(senderId);
                        if (trainer && trainer.id) {
                            author = {
                                _id: trainer.id.toString(),
                                firstName: trainer.firstName || "Unknown",
                                lastName: trainer.lastName || "",
                                email: trainer.email || "",
                                profileImage: trainer.profileImage || undefined,
                                isTrainer: true,
                            };
                        }
                        else {
                            socket.emit("error", {
                                message: "Trainer not found or invalid",
                            });
                            return;
                        }
                    }
                    if (!author) {
                        socket.emit("error", {
                            message: "Failed to fetch author details",
                        });
                        return;
                    }
                    const post = {
                        id: (0, uuid_1.v4)(),
                        author,
                        authorId: senderId,
                        role,
                        textContent: textContent || (mediaUrl ? mediaUrl : ""),
                        category: category,
                        likes: [],
                        isDeleted: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        mediaUrl,
                        reports: [],
                    };
                    const savedPost = yield this._postRepository.save(post);
                    const frontendPost = this.mapToFrontendPost(savedPost, author);
                    this.io.to("community").emit("newPost", frontendPost);
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to create post: ${error.message}`,
                    });
                }
            }));
            socket.on("deletePost", (_a) => __awaiter(this, [_a], void 0, function* ({ postId, role }) {
                if (!socket.userId || !socket.role) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                if (role !== socket.role || !this.isValidRole(role)) {
                    socket.emit("error", { message: "Role mismatch or invalid role" });
                    return;
                }
                try {
                    const post = yield this._postRepository.findById(postId);
                    if (!post ||
                        (post.authorId !== socket.userId && socket.role !== "admin")) {
                        socket.emit("error", {
                            message: "Unauthorized or post not found",
                        });
                        return;
                    }
                    const updatedPost = yield this._postRepository.delete(postId);
                    if (!updatedPost) {
                        socket.emit("error", { message: "Failed to delete post" });
                        return;
                    }
                    this.io.to("community").emit("postDeleted", { postId });
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to delete post: ${error.message}`,
                    });
                }
            }));
            socket.on("joinPost", (postId) => {
                console.log(`[DEBUG] User ${socket.userId} joining post room: post:${postId}`);
                socket.join(`post:${postId}`);
            });
            socket.on("leavePost", (postId) => {
                console.log(`[DEBUG] User ${socket.userId} leaving post room: post:${postId}`);
                socket.leave(`post:${postId}`);
            });
            socket.on("likePost", (_a) => __awaiter(this, [_a], void 0, function* ({ postId, userId, role, }) {
                if (!socket.userId ||
                    !socket.role ||
                    socket.userId !== userId ||
                    role !== socket.role) {
                    socket.emit("error", {
                        message: "User not authenticated or role mismatch",
                    });
                    return;
                }
                try {
                    const updatedPost = yield this._likePostUseCase.execute(postId, userId);
                    this.io.to("community").emit("postLiked", {
                        postId,
                        userId,
                        likes: updatedPost.likes || [],
                        hasLiked: updatedPost.likes.includes(userId),
                    });
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to like post: ${error.message}`,
                    });
                }
            }));
            socket.on("sendCommunityMessage", (data) => __awaiter(this, void 0, void 0, function* () {
                if (!socket.userId || !socket.role) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                if (data.role !== socket.role || !this.isValidRole(data.role)) {
                    socket.emit("error", { message: "Role mismatch or invalid role" });
                    return;
                }
                try {
                    const { postId, senderId, text, media, role, tempId } = data;
                    if (!text && !media) {
                        socket.emit("error", { message: "Text or media is required" });
                        return;
                    }
                    const mediaUrl = media === null || media === void 0 ? void 0 : media.url;
                    let author = null;
                    if (role === "client") {
                        const client = (yield this._clientRepository.findById(senderId)) ||
                            (yield this._clientRepository.findByClientId(senderId));
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
                            socket.emit("error", {
                                message: "Client not found or invalid",
                            });
                            return;
                        }
                    }
                    else if (role === "trainer") {
                        const trainer = yield this._trainerRepository.findById(senderId);
                        if (trainer && trainer.id) {
                            author = {
                                _id: trainer.id.toString(),
                                firstName: trainer.firstName || "Unknown",
                                lastName: trainer.lastName || "",
                                email: trainer.email || "",
                                profileImage: trainer.profileImage || undefined,
                                isTrainer: true,
                            };
                        }
                        else {
                            socket.emit("error", {
                                message: "Trainer not found or invalid",
                            });
                            return;
                        }
                    }
                    const comment = {
                        id: (0, uuid_1.v4)(),
                        postId,
                        authorId: senderId,
                        role,
                        textContent: text || (mediaUrl ? mediaUrl : ""),
                        likes: [],
                        isDeleted: false,
                        reports: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        mediaUrl,
                    };
                    const savedComment = yield this._commentRepository.save(comment);
                    const frontendComment = {
                        id: savedComment.id,
                        tempId,
                        postId: savedComment.postId,
                        authorId: savedComment.authorId,
                        author,
                        role: savedComment.role,
                        textContent: savedComment.textContent,
                        createdAt: savedComment.createdAt.toISOString(),
                        mediaUrl,
                    };
                    this.io
                        .to("community")
                        .emit("receiveCommunityMessage", frontendComment);
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to send community message: ${error.message}`,
                    });
                }
            }));
            socket.on("sendMessage", (data) => __awaiter(this, void 0, void 0, function* () {
                if (!socket.userId || !socket.role) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                try {
                    const { senderId, receiverId, text, media, replyToId, tempId } = data;
                    const isValid = yield this.validateRelationship(senderId, receiverId, socket.role);
                    if (!isValid) {
                        socket.emit("error", {
                            message: "You can only message your connected trainer/client",
                        });
                        return;
                    }
                    const mediaUrl = media === null || media === void 0 ? void 0 : media.url;
                    const mediaType = (media === null || media === void 0 ? void 0 : media.type) || null;
                    const message = {
                        id: (0, uuid_1.v4)(),
                        senderId,
                        receiverId,
                        content: text || "",
                        status: constants_1.MessageStatus.SENT,
                        mediaUrl,
                        mediaType,
                        replyToId,
                        deleted: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        reactions: [],
                    };
                    const savedMessage = yield this._messageRepository.save(message);
                    const frontendMessage = this.mapToFrontendMessage(savedMessage);
                    socket.emit("messageSent", Object.assign(Object.assign({}, frontendMessage), { tempId }));
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io
                            .to(receiverSocketId)
                            .emit("receiveMessage", Object.assign(Object.assign({}, frontendMessage), { tempId }));
                    }
                    if (senderId !== receiverId) {
                        let senderName = "Someone";
                        try {
                            const client = (yield this._clientRepository.findByClientId(senderId)) ||
                                (yield this._clientRepository.findById(senderId));
                            if (client) {
                                senderName = `${client.firstName} ${client.lastName}`;
                            }
                            else {
                                const trainer = yield this._trainerRepository.findById(senderId);
                                if (trainer) {
                                    senderName = `${trainer.firstName} ${trainer.lastName}`;
                                }
                            }
                            yield this._notificationService.sendToUser(receiverId, "New Message", `${senderName} sent you a new message!`, "INFO");
                        }
                        catch (error) {
                            console.error(`Failed to send notification: ${error.message}`);
                        }
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to send message: ${error.message}`,
                    });
                }
            }));
            socket.on("deleteMessage", (_a) => __awaiter(this, [_a], void 0, function* ({ messageId, receiverId }) {
                if (!socket.userId) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                try {
                    const message = yield this._messageRepository.findById(messageId);
                    if (!message || message.senderId !== socket.userId) {
                        socket.emit("error", {
                            message: "Unauthorized or message not found",
                        });
                        return;
                    }
                    yield this._messageRepository.delete(messageId);
                    socket.emit("messageDeleted", { messageId });
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("messageDeleted", { messageId });
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to delete message: ${error.message}`,
                    });
                }
            }));
            socket.on("addReaction", (_a) => __awaiter(this, [_a], void 0, function* ({ messageId, emoji, receiverId }) {
                if (!socket.userId) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                try {
                    const message = yield this._messageRepository.findById(messageId);
                    if (!message) {
                        socket.emit("error", { message: "Message not found" });
                        return;
                    }
                    const updatedMessage = yield this._messageRepository.update(messageId, {
                        reactions: [
                            ...(message.reactions || []),
                            { userId: socket.userId, emoji },
                        ],
                    });
                    if (!updatedMessage) {
                        socket.emit("error", { message: "Failed to add reaction" });
                        return;
                    }
                    const frontendMessage = this.mapToFrontendMessage(updatedMessage);
                    socket.emit("reactionAdded", frontendMessage);
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("reactionAdded", frontendMessage);
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to add reaction: ${error.message}`,
                    });
                }
            }));
            socket.on("removeReaction", (_a) => __awaiter(this, [_a], void 0, function* ({ messageId, emoji, receiverId }) {
                if (!socket.userId) {
                    socket.emit("error", { message: "User not authenticated" });
                    return;
                }
                try {
                    const message = yield this._messageRepository.findById(messageId);
                    if (!message) {
                        socket.emit("error", { message: "Message not found" });
                        return;
                    }
                    const updatedReactions = (message.reactions || []).filter((reaction) => !(reaction.userId === socket.userId && reaction.emoji === emoji));
                    const updatedMessage = yield this._messageRepository.update(messageId, { reactions: updatedReactions });
                    if (!updatedMessage) {
                        socket.emit("error", { message: "Failed to remove reaction" });
                        return;
                    }
                    const frontendMessage = this.mapToFrontendMessage(updatedMessage);
                    socket.emit("reactionRemoved", frontendMessage);
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io
                            .to(receiverSocketId)
                            .emit("reactionRemoved", frontendMessage);
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to remove reaction: ${error.message}`,
                    });
                }
            }));
            socket.on("typing", ({ chatId, userId }) => {
                if (!socket.userId)
                    return;
                const receiverId = this.getReceiverIdFromChatId(chatId, userId);
                if (receiverId) {
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("typing", { chatId, userId });
                    }
                }
            });
            socket.on("stopTyping", ({ chatId, userId }) => {
                if (!socket.userId)
                    return;
                const receiverId = this.getReceiverIdFromChatId(chatId, userId);
                if (receiverId) {
                    const receiverSocketId = this.getSocketId(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("stopTyping", { chatId, userId });
                    }
                }
            });
            socket.on("markAsRead", (_a) => __awaiter(this, [_a], void 0, function* ({ senderId, receiverId }) {
                if (!socket.userId || socket.userId !== receiverId) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }
                try {
                    yield this._messageRepository.markMessagesAsRead(senderId, receiverId);
                    socket.emit("messagesRead", { senderId, receiverId });
                    const senderSocketId = this.getSocketId(senderId);
                    if (senderSocketId) {
                        this.io
                            .to(senderSocketId)
                            .emit("messagesRead", { senderId, receiverId });
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to mark messages as read: ${error.message}`,
                    });
                }
            }));
            socket.on("checkConnection", () => {
                socket.emit("connectionStatus", {
                    isConnected: socket.connected,
                    userId: socket.userId,
                    role: socket.role,
                });
            });
            socket.on("getRooms", (callback) => {
                const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
                console.log(`[DEBUG] Rooms for socket ${socket.id}:`, rooms);
                callback(rooms);
            });
            socket.on("disconnect", (reason) => __awaiter(this, void 0, void 0, function* () {
                if (socket.userId && socket.role) {
                    // Clean up userSocketMap
                    const userSockets = this.userSocketMap.get(socket.userId);
                    if (userSockets) {
                        userSockets.delete(socket.id);
                        if (userSockets.size === 0) {
                            this.userSocketMap.delete(socket.userId);
                        }
                        console.log(`[${new Date().toISOString()}] Socket ${socket.id} disconnected for user ${socket.userId}, remaining sockets: ${userSockets.size}`);
                    }
                    try {
                        if (socket.role === "client") {
                            yield this._clientRepository.findByIdAndUpdate(socket.userId, {
                                isOnline: false,
                            });
                        }
                        else if (socket.role === "trainer") {
                            yield this._trainerRepository.findByIdAndUpdate(socket.userId, {
                                isOnline: false,
                            });
                        }
                    }
                    catch (error) { }
                    this.connectedUsers.delete(socket.userId);
                    yield this.notifyUserStatus(socket.userId, socket.role, false);
                    socket.leave("community");
                }
            }));
        });
    }
    notifyUserStatus(userId, role, isOnline) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (role === "client") {
                    const client = (yield this._clientRepository.findById(userId)) ||
                        (yield this._clientRepository.findByClientId(userId));
                    if (client === null || client === void 0 ? void 0 : client.selectedTrainerId) {
                        const trainerSocketId = this.getSocketId(client.selectedTrainerId);
                        if (trainerSocketId) {
                            this.io.to(trainerSocketId).emit("userStatus", {
                                userId,
                                status: isOnline ? "online" : "offline",
                                lastSeen: isOnline ? undefined : new Date().toISOString(),
                            });
                        }
                    }
                }
                else if (role === "trainer") {
                    const { items: clients } = yield this._clientRepository.find({
                        selectedTrainerId: userId,
                        selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                    }, 0, 100);
                    for (const client of clients) {
                        const clientId = client.clientId || (client.id ? client.id.toString() : null);
                        if (clientId) {
                            const clientSocketId = this.getSocketId(clientId);
                            if (clientSocketId) {
                                this.io.to(clientSocketId).emit("userStatus", {
                                    userId,
                                    status: isOnline ? "online" : "offline",
                                    lastSeen: isOnline ? undefined : new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            }
            catch (error) { }
        });
    }
    validateRelationship(senderId, receiverId, senderRole) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (senderRole === "client") {
                    const client = (yield this._clientRepository.findById(senderId)) ||
                        (yield this._clientRepository.findByClientId(senderId));
                    return (!!client &&
                        client.isPremium === true &&
                        client.selectStatus === constants_1.TrainerSelectionStatus.ACCEPTED &&
                        client.selectedTrainerId === receiverId);
                }
                else if (senderRole === "trainer") {
                    const client = (yield this._clientRepository.findById(receiverId)) ||
                        (yield this._clientRepository.findByClientId(receiverId));
                    return (!!client &&
                        client.isPremium === true &&
                        client.selectStatus === constants_1.TrainerSelectionStatus.ACCEPTED &&
                        client.selectedTrainerId === senderId);
                }
                return false;
            }
            catch (error) {
                return false;
            }
        });
    }
    logTrainerClientConnection(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (role === "client") {
                    const client = (yield this._clientRepository.findById(userId)) ||
                        (yield this._clientRepository.findByClientId(userId));
                    if ((client === null || client === void 0 ? void 0 : client.selectedTrainerId) &&
                        this.isUserConnected(client.selectedTrainerId)) {
                    }
                }
                else if (role === "trainer") {
                    const { items: clients } = yield this._clientRepository.find({
                        selectedTrainerId: userId,
                        selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                    }, 0, 100);
                    for (const client of clients) {
                        const clientId = client.clientId || (client.id ? client.id.toString() : null);
                        if (clientId && this.isUserConnected(clientId)) {
                        }
                    }
                }
            }
            catch (error) { }
        });
    }
    getReceiverIdFromChatId(chatId, senderId) {
        const [id1, id2] = chatId.split("_");
        return id1 === senderId ? id2 : id1 === id2 ? null : id1;
    }
    mapToFrontendMessage(message) {
        var _a;
        return {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            text: message.content,
            status: message.status,
            timestamp: message.createdAt.toISOString(),
            media: message.mediaUrl
                ? { type: message.mediaType || "file", url: message.mediaUrl }
                : undefined,
            replyToId: message.replyToId,
            reactions: message.reactions || [],
            deleted: message.deleted || false,
            readAt: message.status === constants_1.MessageStatus.READ
                ? (_a = message.updatedAt) === null || _a === void 0 ? void 0 : _a.toISOString()
                : undefined,
        };
    }
    mapToFrontendPost(post, fallbackAuthor) {
        if (!post.id) {
            throw new Error(`Post ID is undefined for post with authorId: ${post.authorId}`);
        }
        const category = constants_1.WORKOUT_TYPES.includes(post.category)
            ? post.category
            : "General";
        return {
            id: post.id,
            author: post.author || fallbackAuthor || null,
            authorId: post.authorId,
            role: post.role,
            textContent: post.textContent,
            mediaUrl: post.mediaUrl,
            category,
            likes: post.likes,
            commentsCount: post.commentsCount || 0,
            createdAt: post.createdAt.toISOString(),
            isDeleted: post.isDeleted || false,
        };
    }
    getSocketId(userId) {
        const userInfo = this.connectedUsers.get(userId);
        if (userInfo) {
            return userInfo.socketId;
        }
        const mappedId = this.idMapping.get(userId);
        if (mappedId) {
            const mappedUserInfo = this.connectedUsers.get(mappedId);
            if (mappedUserInfo) {
                return mappedUserInfo.socketId;
            }
        }
        for (const [key, value] of this.idMapping.entries()) {
            if (value === userId) {
                const reverseUserInfo = this.connectedUsers.get(key);
                if (reverseUserInfo) {
                    return reverseUserInfo.socketId;
                }
            }
        }
        return null;
    }
    getIO() {
        return this.io;
    }
    getConnectedUser(userId) {
        const direct = this.connectedUsers.get(userId);
        if (direct)
            return direct;
        const mappedId = this.idMapping.get(userId);
        if (mappedId) {
            return this.connectedUsers.get(mappedId);
        }
        for (const [key, value] of this.idMapping.entries()) {
            if (value === userId) {
                return this.connectedUsers.get(key);
            }
        }
        return undefined;
    }
    isUserConnected(userId) {
        if (this.connectedUsers.has(userId))
            return true;
        const mappedId = this.idMapping.get(userId);
        if (mappedId && this.connectedUsers.has(mappedId))
            return true;
        for (const [key, value] of this.idMapping.entries()) {
            if (value === userId && this.connectedUsers.has(key))
                return true;
        }
        return false;
    }
    getUserRole(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this._clientRepository.findById(userId);
            if (client)
                return "client";
            const trainer = yield this._trainerRepository.findById(userId);
            if (trainer)
                return "trainer";
            return "admin";
        });
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IMessageRepository")),
    __param(1, (0, tsyringe_1.inject)("ICommentRepository")),
    __param(2, (0, tsyringe_1.inject)("IPostRepository")),
    __param(3, (0, tsyringe_1.inject)("IClientRepository")),
    __param(4, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(5, (0, tsyringe_1.inject)("ILikePostUseCase")),
    __param(6, (0, tsyringe_1.inject)("NotificationService")),
    __param(7, (0, tsyringe_1.inject)("ITokenService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, notification_service_1.NotificationService, Object])
], SocketService);
