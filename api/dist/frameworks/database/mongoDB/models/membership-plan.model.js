"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipPlanModel = void 0;
const mongoose_1 = require("mongoose");
const membership_plan_schema_1 = require("../schemas/membership-plan.schema");
exports.MembershipPlanModel = (0, mongoose_1.model)("MembershipPlan", membership_plan_schema_1.membershipPlanSchema);
