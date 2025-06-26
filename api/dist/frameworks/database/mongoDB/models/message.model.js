"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const message_schema_1 = require("../schemas/message.schema");
exports.MessageModel = (0, mongoose_1.model)("Message", message_schema_1.messageSchema);
