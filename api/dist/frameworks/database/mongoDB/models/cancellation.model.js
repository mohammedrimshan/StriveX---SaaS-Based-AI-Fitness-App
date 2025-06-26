"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancellationModel = void 0;
const mongoose_1 = require("mongoose");
const cancellation_schema_1 = require("../schemas/cancellation.schema");
exports.CancellationModel = (0, mongoose_1.model)("Cancellation", cancellation_schema_1.cancellationSchema);
