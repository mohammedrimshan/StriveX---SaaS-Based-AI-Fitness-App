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
exports.SocketNotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const socket_service_1 = require("./socket.service");
let SocketNotificationService = class SocketNotificationService {
    constructor(socketService) {
        this.socketService = socketService;
    }
    emitNotification(userId, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!userId || !notification) {
                console.error(`[${new Date().toISOString()}] Invalid userId or notification`, { userId, notification });
                return;
            }
            const notificationPayload = Object.assign(Object.assign({}, notification), { id: (_b = (_a = notification.id) !== null && _a !== void 0 ? _a : (typeof notification._id === "object" && "toString" in notification._id
                    ? notification._id.toString()
                    : undefined)) !== null && _b !== void 0 ? _b : crypto.randomUUID(), createdAt: notification.createdAt instanceof Date
                    ? notification.createdAt.toISOString()
                    : notification.createdAt });
            console.log(`[${new Date().toISOString()}] Emitting notification to user:${userId} and notifications:${userId}`, JSON.stringify(notificationPayload, null, 2));
            const io = this.socketService.getIO();
            try {
                // Fetch sockets in the notifications room
                const sockets = yield io.in(`notifications:${userId}`).fetchSockets();
                if (sockets.length === 0) {
                    console.warn(`[${new Date().toISOString()}] No active sockets found for user ${userId}`);
                }
                else {
                    sockets.forEach((socket) => {
                        io.to(socket.id).emit("notification", notificationPayload); // Emit to individual socket IDs
                    });
                    console.log(`[${new Date().toISOString()}] Emitted to ${sockets.length} socket(s) for user:${userId}`);
                }
                // Also emit to rooms for backward compatibility
                io.to(`user:${userId}`)
                    .to(`notifications:${userId}`)
                    .emit("notification", notificationPayload);
                // Log sockets in both rooms
                const userRoomSockets = yield io.in(`user:${userId}`).allSockets();
                console.log(`[${new Date().toISOString()}] Sockets in user:${userId} room: ${userRoomSockets.size}`, Array.from(userRoomSockets));
                const notifRoomSockets = yield io
                    .in(`notifications:${userId}`)
                    .allSockets();
                console.log(`[${new Date().toISOString()}] Sockets in notifications:${userId} room: ${notifRoomSockets.size}`, Array.from(notifRoomSockets));
                if (userRoomSockets.size === 0 && notifRoomSockets.size === 0) {
                    console.warn(`[${new Date().toISOString()}] No sockets in rooms for user:${userId}. Checking all sockets.`);
                    const allSockets = yield io.allSockets();
                    console.log(`[${new Date().toISOString()}] Total connected sockets: ${allSockets.size}`, Array.from(allSockets));
                }
            }
            catch (err) {
                console.error(`[${new Date().toISOString()}] Error checking sockets for user:${userId}`, err);
            }
        });
    }
};
exports.SocketNotificationService = SocketNotificationService;
exports.SocketNotificationService = SocketNotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("SocketService")),
    __metadata("design:paramtypes", [socket_service_1.SocketService])
], SocketNotificationService);
