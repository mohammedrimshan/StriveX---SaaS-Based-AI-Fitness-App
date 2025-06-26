"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerChangeRequestModel = void 0;
const mongoose_1 = require("mongoose");
const trainerchangerequest_schema_1 = require("../schemas/trainerchangerequest.schema");
exports.TrainerChangeRequestModel = (0, mongoose_1.model)("TrainerChangeRequest", trainerchangerequest_schema_1.TrainerChangeRequestSchema);
