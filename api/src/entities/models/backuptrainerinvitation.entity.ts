import { BackupInvitationStatus } from "@/shared/constants";

export interface IBackupTrainerInvitationEntity {
    id: string;
  clientId: string;
  trainerId: string;
  status: BackupInvitationStatus;
  sentAt?: Date;
  respondedAt?: Date | null;
  expiresAt: Date;
  isFallback?: boolean;
}
