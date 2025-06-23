import { BackupClient } from "@/components/BackupTrainer/Admin/BackUpClients";

export enum BackupInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  AUTO_ASSIGNED = "AUTO_ASSIGNED",
}

export enum TrainerChangeRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface TrainerSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  specialization: string[];
}

export interface BackupTrainerInvitation {
  id: string;
  clientId: string;
  trainerId: string;
  status: BackupInvitationStatus;
  sentAt?: string;
  respondedAt?: string | null;
  expiresAt: string;
  isFallback?: boolean;
  trainer: TrainerSummary | null;
}

export interface GetBackupTrainerInvitationsResponse {
  invitations: BackupTrainerInvitation[];
  totalPages: number;
  currentPage: number;
  totalInvitations: number;
  success: boolean;
  message: string;
}


export interface BackupTrainerSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
}

export interface TrainerChangeRequest {
  _id: string;
  clientId: string;
  backupTrainerId: string;
  requestType: "CHANGE" | "REVOKE";
  reason?: string;
  status: TrainerChangeRequestStatus;
  createdAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  backupTrainer: BackupTrainerSummary | null;
}

export interface GetTrainerChangeRequestsResponse {
  requests: TrainerChangeRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
  success: boolean;
  message: string;
}


export interface SubmitTrainerChangeRequestPayload {
  backupTrainerId: string;
  requestType: "CHANGE" | "REVOKE";
  reason: string;
}

export interface TrainerChangeRequestResponse {
  success: boolean;
  message: string;
  request: {
    _id: string;
    clientId: string;
    backupTrainerId: string;
    requestType: "CHANGE" | "REVOKE";
    reason: string;
    status: TrainerChangeRequestStatus;
    createdAt?: string;
    resolvedAt?: string;
    resolvedBy?: string;
  };
}

export interface TrainerBackupInvitationResponse {
  success: boolean;
  message: string;
  invitations: TrainerBackupInvitation[];
  totalPages: number;
  currentPage: number;
  totalInvitations: number;
}

export interface TrainerBackupInvitation {
  id: string;
  clientId: string;
  trainerId: string;
  status: TrainerChangeRequest;
  sentAt: string;
  respondedAt?: string | null;
  expiresAt: string;
  isFallback?: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    preferedWorkout: string;
    fitnessGoal: string;
  } | null;
}

export interface RespondToInvitationPayload {
  invitationId: string;
  action: "accept" | "reject";
}


export interface ResolveTrainerChangeRequestPayload {
  requestId: string;
  action: "approve" | "reject";
}

export interface BackupClientsOverviewResponse {
  success: boolean;
  message: string;
  clients: BackupClient[];
  totalPages: number;
  currentPage: number;
  totalClients: number;
}

export interface AdminClientBackupOverviewParams {
  page?: number;
  limit?: number;
}

export interface AssignBackupTrainerResponse {
  success: boolean;
  message: string;
  client: any; // replace with your Client type if available
}