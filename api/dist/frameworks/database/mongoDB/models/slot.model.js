"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotModel = void 0;
const mongoose_1 = require("mongoose");
const slot_schema_1 = require("../schemas/slot.schema");
exports.SlotModel = (0, mongoose_1.model)("Slot", slot_schema_1.slotSchema);
