import { model, Document } from "mongoose";
import { BackupTrainerInvitationSchema } from "../schemas/backuptrainerinvitation.schema";

export interface IBackupTrainerInvitationModel extends Document {
  clientId: string;
  trainerId: string;
  status: string;
  sentAt: Date;
  respondedAt?: Date | null;
  expiresAt: Date;
  isFallback: boolean;
}

export const BackupTrainerInvitationModel = model<IBackupTrainerInvitationModel>(
  "BackupTrainerInvitation",
  BackupTrainerInvitationSchema
);
