"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const mongoose_1 = require("mongoose");
const refresh_token_schema_1 = require("../schemas/refresh-token.schema");
exports.RefreshTokenModel = (0, mongoose_1.model)("RefreshToken", refresh_token_schema_1.RefreshTokenSchema);
