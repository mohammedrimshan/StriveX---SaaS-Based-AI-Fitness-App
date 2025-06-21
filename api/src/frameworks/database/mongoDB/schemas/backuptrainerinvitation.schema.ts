import { Schema } from "mongoose";
import { BackupInvitationStatus } from "@/shared/constants";
import { IBackupTrainerInvitationModel } from "../models/backuptrainerinvitation.model";

export const BackupTrainerInvitationSchema = new Schema<IBackupTrainerInvitationModel>({
  clientId: { type: String, required: true, index: true },
  trainerId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: Object.values(BackupInvitationStatus),
    required: true,
    default: BackupInvitationStatus.PENDING,
  },
  sentAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
  isFallback: { type: Boolean, default: false },
});
