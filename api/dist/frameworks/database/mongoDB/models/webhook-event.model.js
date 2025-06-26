"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventModel = void 0;
const mongoose_1 = require("mongoose");
const webhook_event_schema_1 = require("../schemas/webhook-event.schema");
exports.WebhookEventModel = (0, mongoose_1.model)("WebhookEvent", webhook_event_schema_1.webhookEventSchema);
