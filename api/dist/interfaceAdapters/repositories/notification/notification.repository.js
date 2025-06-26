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
exports.NotificationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const notification_model_1 = require("@/frameworks/database/mongoDB/models/notification.model");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const base_repository_1 = require("../base.repository");
let NotificationRepository = class NotificationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(notification_model_1.NotificationModel);
    }
    create(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`[${new Date().toISOString()}] Creating notification: ${JSON.stringify(notification)}`);
                const createdNotification = yield this.model.create(notification);
                const result = this.mapToEntity(createdNotification.toObject());
                console.log(`[${new Date().toISOString()}] Created notification: ${JSON.stringify(result)}`);
                return result;
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to create notification", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    findByUserId(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { userId };
                const notifications = yield this.model
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean();
                return notifications.map((doc) => this.mapToEntity(doc));
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to fetch notifications", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(notificationId, "Notification ID");
            try {
                const updatedNotification = yield this.model
                    .findByIdAndUpdate(notificationId, { $set: { isRead: true } }, { new: true })
                    .lean();
                if (!updatedNotification) {
                    throw new custom_error_1.CustomError("Notification not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    throw error;
                }
                throw new custom_error_1.CustomError("Failed to mark notification as read", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], NotificationRepository);
