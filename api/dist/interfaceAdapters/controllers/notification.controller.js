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
exports.NotificationController = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const constants_1 = require("@/shared/constants");
let NotificationController = class NotificationController {
    constructor(notificationService, getNotifications, updateFCMTokenUseCase) {
        this.notificationService = notificationService;
        this.getNotifications = getNotifications;
        this.updateFCMTokenUseCase = updateFCMTokenUseCase;
    }
    sendNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, title, message, type } = req.body;
                if (!userId || !title || !message || !type) {
                    throw new Error("Missing required fields");
                }
                const notification = yield this.notificationService.sendToUser(userId, title, message, type);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: notification,
                    message: "Notification sent successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getAllNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", size, limit = "10" } = req.query;
                const notifications = yield this.getNotifications.execute(parseInt(page, 10), parseInt(limit, 10));
                console.log(`[${new Date().toISOString()}] Retrieved ${notifications.length} notifications`);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: notifications,
                    message: "Notifications retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getUserNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userPayload = req.user;
                const userId = typeof userPayload === "string" ? userPayload : userPayload.id;
                const { page = "1", limit = "10" } = req.query;
                const notifications = yield this.notificationService.getUserNotifications(userId, parseInt(page, 10), parseInt(limit, 10));
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: notifications,
                    message: "User notifications retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    markNotificationAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { notificationId } = req.params;
                yield this.notificationService.markAsRead(notificationId);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    status: "success",
                    data: null,
                    message: "Notification marked as read",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateFCMToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, fcmToken } = req.body;
                yield this.updateFCMTokenUseCase.execute(userId, fcmToken);
                res.status(constants_1.HTTP_STATUS.OK).json({ message: "FCM token updated" });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("NotificationService")),
    __param(1, (0, tsyringe_1.inject)("IGetNotifications")),
    __param(2, (0, tsyringe_1.inject)("IUpdateFCMTokenUseCase")),
    __metadata("design:paramtypes", [notification_service_1.NotificationService, Object, Object])
], NotificationController);
