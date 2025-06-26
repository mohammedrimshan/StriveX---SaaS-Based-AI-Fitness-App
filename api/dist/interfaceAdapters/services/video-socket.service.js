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
exports.VideoSocketService = void 0;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
let VideoSocketService = class VideoSocketService {
    constructor(clientRepository, trainerRepository, slotRepository, startVideoCallUseCase, joinVideoCallUseCase, endVideoCallUseCase, notificationService, jwtService) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.slotRepository = slotRepository;
        this.startVideoCallUseCase = startVideoCallUseCase;
        this.joinVideoCallUseCase = joinVideoCallUseCase;
        this.endVideoCallUseCase = endVideoCallUseCase;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server({
            cors: {
                origin: process.env.CORS_ALLOWED_ORIGIN || "https://strivex.rimshan.in/",
                methods: ["GET", "POST"],
                credentials: true,
            },
            pingTimeout: 300000,
            pingInterval: 10000,
            path: "/socket.io/video",
            transports: ["websocket", "polling"],
            allowEIO3: true,
            connectTimeout: 30000,
            maxHttpBufferSize: 1e8,
        });
    }
    isValidRole(role) {
        return ["client", "trainer", "admin"].includes(role);
    }
    initialize(server) {
        this.io.attach(server);
        this.io.on("connection", (socket) => {
            socket.on("register", (_a) => __awaiter(this, [_a], void 0, function* ({ userId, role, token }) {
                console.log(token, userId, role, "register");
                if (!userId || !this.isValidRole(role) || !token) {
                    socket.emit("error", { message: "Invalid user ID, role, or token" });
                    socket.disconnect();
                    return;
                }
                try {
                    const payload = this.jwtService.verifyAccessToken(token);
                    console.log(payload, "payload");
                    if (!payload || payload.id !== userId || payload.role !== role) {
                        socket.emit("error", { message: "Invalid or expired token" });
                        socket.disconnect();
                        return;
                    }
                    let userExists = false;
                    let standardizedUserId = userId;
                    if (role === "client") {
                        const client = (yield this.clientRepository.findByClientId(userId)) ||
                            (yield this.clientRepository.findById(userId));
                        if (client && client.id) {
                            userExists = true;
                            standardizedUserId = client.id.toString();
                        }
                    }
                    else if (role === "trainer") {
                        const trainer = yield this.trainerRepository.findById(userId);
                        if (trainer && trainer.id) {
                            userExists = true;
                            standardizedUserId = trainer.id.toString();
                        }
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
                        userId: standardizedUserId,
                        role,
                    });
                    socket.emit("registerSuccess", { userId: standardizedUserId });
                }
                catch (error) {
                    socket.emit("error", { message: "Error during authentication" });
                    socket.disconnect();
                }
            }));
            socket.on("startVideoCall", (_a) => __awaiter(this, [_a], void 0, function* ({ slotId, userId, role }) {
                if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
                    socket.emit("error", { message: "User not authenticated or role mismatch" });
                    return;
                }
                try {
                    const slot = yield this.startVideoCallUseCase.execute(slotId, userId, role);
                    const receiverId = role === "trainer" ? slot.clientId : slot.trainerId.toString();
                    if (!receiverId) {
                        socket.emit("error", { message: "No receiver found for the slot" });
                        return;
                    }
                    const receiverSocketId = this.getSocketId(receiverId);
                    socket.emit("videoCallStarted", {
                        slotId,
                        roomName: slot.videoCallRoomName,
                        videoCallStatus: slot.videoCallStatus,
                    });
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("videoCallStarted", {
                            slotId,
                            roomName: slot.videoCallRoomName,
                            videoCallStatus: slot.videoCallStatus,
                        });
                        const sender = role === "client"
                            ? yield this.clientRepository.findByClientId(userId)
                            : yield this.trainerRepository.findById(userId);
                        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Someone";
                        yield this.notificationService.sendToUser(receiverId, "Video Call Started", `${senderName} has started a video call for slot ${slotId}.`, "INFO");
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to start video call: ${error.message}`,
                    });
                }
            }));
            socket.on("joinVideoCall", (_a) => __awaiter(this, [_a], void 0, function* ({ slotId, userId, role }) {
                if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
                    socket.emit("error", { message: "User not authenticated or role mismatch" });
                    return;
                }
                try {
                    const slot = yield this.joinVideoCallUseCase.execute(slotId, userId, role);
                    socket.emit("videoCallJoined", {
                        slotId,
                        roomName: slot.videoCallRoomName,
                        videoCallStatus: slot.videoCallStatus,
                    });
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to join video call: ${error.message}`,
                    });
                }
            }));
            socket.on("endVideoCall", (_a) => __awaiter(this, [_a], void 0, function* ({ slotId, userId, role }) {
                if (!socket.userId || socket.userId !== userId || !socket.role || socket.role !== role) {
                    socket.emit("error", { message: "User not authenticated or role mismatch" });
                    return;
                }
                try {
                    const slot = yield this.endVideoCallUseCase.execute(slotId, userId, role);
                    const receiverId = role === "trainer" ? slot.clientId : slot.trainerId.toString();
                    if (!receiverId) {
                        socket.emit("error", { message: "No receiver found for the slot" });
                        return;
                    }
                    const receiverSocketId = this.getSocketId(receiverId);
                    socket.emit("videoCallEnded", {
                        slotId,
                        videoCallStatus: slot.videoCallStatus,
                    });
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("videoCallEnded", {
                            slotId,
                            videoCallStatus: slot.videoCallStatus,
                        });
                        const sender = role === "client"
                            ? yield this.clientRepository.findByClientId(userId)
                            : yield this.trainerRepository.findById(userId);
                        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Someone";
                        yield this.notificationService.sendToUser(receiverId, "Video Call Ended", `${senderName} has ended the video call for slot ${slotId}.`, "INFO");
                    }
                }
                catch (error) {
                    socket.emit("error", {
                        message: `Failed to end video call: ${error.message}`,
                    });
                }
            }));
            socket.on("disconnect", () => {
                if (socket.userId) {
                    this.connectedUsers.delete(socket.userId);
                }
            });
        });
    }
    getSocketId(userId) {
        const userInfo = this.connectedUsers.get(userId);
        return userInfo ? userInfo.socketId : null;
    }
    getIO() {
        return this.io;
    }
};
exports.VideoSocketService = VideoSocketService;
exports.VideoSocketService = VideoSocketService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(3, (0, tsyringe_1.inject)("IStartVideoCallUseCase")),
    __param(4, (0, tsyringe_1.inject)("IJoinVideoCallUseCase")),
    __param(5, (0, tsyringe_1.inject)("IEndVideoCallUseCase")),
    __param(6, (0, tsyringe_1.inject)("NotificationService")),
    __param(7, (0, tsyringe_1.inject)("ITokenService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, notification_service_1.NotificationService, Object])
], VideoSocketService);
