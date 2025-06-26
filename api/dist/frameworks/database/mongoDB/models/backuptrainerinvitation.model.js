"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupTrainerInvitationModel = void 0;
const mongoose_1 = require("mongoose");
const backuptrainerinvitation_schema_1 = require("../schemas/backuptrainerinvitation.schema");
exports.BackupTrainerInvitationModel = (0, mongoose_1.model)("BackupTrainerInvitation", backuptrainerinvitation_schema_1.BackupTrainerInvitationSchema);
