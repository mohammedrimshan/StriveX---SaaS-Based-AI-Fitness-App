"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProgressHistoryModel = void 0;
const mongoose_1 = require("mongoose");
const client_history_schema_1 = require("../schemas/client.history.schema");
exports.ClientProgressHistoryModel = (0, mongoose_1.model)("ClientProgressHistory", client_history_schema_1.ClientProgressHistorySchema);
