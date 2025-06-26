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
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let NotificationService = class NotificationService {
    constructor(notificationRepository, fcmService, socketService, clientModel) {
        this.notificationRepository = notificationRepository;
        this.fcmService = fcmService;
        this.socketService = socketService;
        this.clientModel = clientModel;
    }
    sendToUser(userId, title, message, type, actionLink, relatedEntityId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const notification = Object.assign(Object.assign({ userId,
                title,
                message,
                type, isRead: false, createdAt: new Date() }, (actionLink ? { actionLink } : {})), (relatedEntityId ? { relatedEntityId } : {}));
            const savedNotification = yield this.notificationRepository.create(notification);
            this.socketService.emitNotification(userId, savedNotification);
            try {
                yield this.fcmService.sendPushNotification(userId, title, message, ((_a = savedNotification.id) !== null && _a !== void 0 ? _a : "").toString(), type);
            }
            catch (error) {
                console.error(`Failed to send push notification to user ${userId}:`, error);
            }
            return Object.assign(Object.assign({}, savedNotification), { id: ((_b = savedNotification.id) !== null && _b !== void 0 ? _b : "").toString() });
        });
    }
    markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(notificationId, "NOTIFICATION ID MARK AS READ");
            try {
                yield this.notificationRepository.markAsRead(notificationId);
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to mark notification as read", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getUserNotifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            console.log(userId, "NOTIFICATION USER ID");
            try {
                return yield this.notificationRepository.findByUserId(userId, page, limit);
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to fetch notifications", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("INotificationRepository")),
    __param(1, (0, tsyringe_1.inject)("IFCMService")),
    __param(2, (0, tsyringe_1.inject)("INotificationSocketService")),
    __param(3, (0, tsyringe_1.inject)("IClientRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationService);
