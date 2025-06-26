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
exports.FCMService = void 0;
const tsyringe_1 = require("tsyringe");
const messaging_1 = require("firebase-admin/messaging");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let FCMService = class FCMService {
    constructor(clientModel, trainerModel, adminModel) {
        this.clientModel = clientModel;
        this.trainerModel = trainerModel;
        this.adminModel = adminModel;
    }
    sendPushNotification(userId_1, title_1, message_1, notificationId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, title, message, notificationId, type = "INFO") {
            try {
                let user = yield this.clientModel.findById(userId);
                if (!user) {
                    user = yield this.trainerModel.findById(userId);
                }
                if (!user) {
                    user = yield this.adminModel.findById(userId);
                }
                if (!(user === null || user === void 0 ? void 0 : user.fcmToken)) {
                    console.warn(`[DEBUG] No FCM token for user ${userId}`);
                    return;
                }
                console.log(`[DEBUG] Found FCM token for user ${userId}: ${user.fcmToken}`);
                // Send FCM message
                const fcmMessage = {
                    token: user.fcmToken,
                    notification: { title, body: message },
                    data: {
                        id: notificationId,
                        type,
                    },
                };
                yield (0, messaging_1.getMessaging)().send(fcmMessage);
                console.log(`[DEBUG] Push sent successfully to ${userId}`);
                console.log(`[DEBUG] Push notification sent to ${userId}, ID: ${notificationId}`);
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    throw error;
                }
                throw new custom_error_1.CustomError("Failed to send push notification", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.FCMService = FCMService;
exports.FCMService = FCMService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IAdminRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], FCMService);
