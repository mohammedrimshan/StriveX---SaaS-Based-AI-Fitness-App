"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionHistoryModel = void 0;
const mongoose_1 = require("mongoose");
const session_history_schema_1 = require("../schemas/session-history.schema");
exports.SessionHistoryModel = (0, mongoose_1.model)("SessionHistory", session_history_schema_1.sessionHistorySchema);
