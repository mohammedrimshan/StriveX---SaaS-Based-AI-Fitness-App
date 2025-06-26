"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DietPlanModel = void 0;
const mongoose_1 = require("mongoose");
const ai_dietplan_schema_1 = require("../schemas/ai-dietplan.schema");
exports.DietPlanModel = (0, mongoose_1.model)("DietPlan", ai_dietplan_schema_1.DietPlanSchema);
