"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModel = void 0;
const mongoose_1 = require("mongoose");
const admin_schema_1 = require("../schemas/admin.schema");
exports.AdminModel = (0, mongoose_1.model)("Admin", admin_schema_1.adminSchema);
