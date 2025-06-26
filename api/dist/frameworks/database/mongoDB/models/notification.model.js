"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const notification_schema_1 = require("../schemas/notification.schema");
exports.NotificationModel = (0, mongoose_1.model)('Notification', notification_schema_1.NotificationSchema);
