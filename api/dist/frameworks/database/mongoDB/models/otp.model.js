"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpModel = void 0;
const mongoose_1 = require("mongoose");
const otp_schema_1 = require("../schemas/otp.schema");
exports.OtpModel = (0, mongoose_1.model)("Otp", otp_schema_1.OtpSchema);
