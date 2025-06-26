"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerEarningsModel = void 0;
const mongoose_1 = require("mongoose");
const trainer_earnings_schema_1 = require("../schemas/trainer-earnings.schema");
exports.TrainerEarningsModel = (0, mongoose_1.model)("TrainerEarnings", trainer_earnings_schema_1.trainerEarningsSchema);
