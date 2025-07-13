import { axiosInstance } from "@/api/private.axios";
import { Params } from "@/hooks/backuptrainer/useAllTrainerChangeRequests";
import {
  AdminClientBackupOverviewParams,
  AssignBackupTrainerResponse,
  BackupClientsOverviewResponse,
  GetBackupTrainerInvitationsResponse,
  GetTrainerChangeRequestsResponse,
  ResolveTrainerChangeRequestPayload,
  RespondToInvitationPayload,
  SubmitTrainerChangeRequestPayload,
  TrainerBackupInvitationResponse,
  TrainerChangeRequestResponse,
} from "@/types/backuptrainer";

// Client: Get backup trainer invitations
export const getClientBackupInvitations = async (
  page: number = 1,
  limit: number = 10
): Promise<GetBackupTrainerInvitationsResponse> => {
  const response = await axiosInstance.get<GetBackupTrainerInvitationsResponse>(
    `/client/backup-trainer/invitations?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Client: Get trainer change requests
export const getClientTrainerChangeRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<GetTrainerChangeRequestsResponse> => {
  const response = await axiosInstance.get<GetTrainerChangeRequestsResponse>(
    `/client/backup-trainer/getrequests?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Client: Submit trainer change request
export const submitTrainerChangeRequest = async (
  payload: SubmitTrainerChangeRequestPayload
): Promise<TrainerChangeRequestResponse> => {
  const response = await axiosInstance.post<TrainerChangeRequestResponse>(
    "/client/backup-trainer/request",
    payload
  );
  return response.data;
};

// Trainer: Get backup trainer invitations
export const getTrainerBackupInvitations = async (
  page: number = 1,
  limit: number = 10
): Promise<TrainerBackupInvitationResponse> => {
  const response = await axiosInstance.get<TrainerBackupInvitationResponse>(
    `/trainer/backup-trainer/invitation?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Trainer: Respond to backup invitation
export const respondToBackupInvitation = async (
  payload: RespondToInvitationPayload
): Promise<any> => {
  const response = await axiosInstance.post(
    "/trainer/backup-trainer/invitation",
    payload
  );
  return response.data;
};

// Trainer: Get backup clients
export const getTrainerBackupClients = async (
  page: number = 1,
  limit: number = 10
) => {
  const response = await axiosInstance.get("/trainer/backup-trainer/clients", {
    params: { page, limit },
  });
  return response.data;
};

// Admin: Get all trainer change requests
export const getAllTrainerChangeRequests = async ({
  page = 1,
  limit = 10,
  status,
}: Params) => {
  const response = await axiosInstance.get("/admin/backup-trainer/change-requests", {
    params: { page, limit, status },
  });
  return response.data;
};

// Admin: Get backup clients overview
export const getBackupClientsOverview = async ({
  page = 1,
  limit = 10,
}: AdminClientBackupOverviewParams): Promise<BackupClientsOverviewResponse> => {
  const response = await axiosInstance.get("/admin/backup-trainer/clients-overview", {
    params: { page, limit },
  });
  return response.data;
};

// Admin: Resolve trainer change request
export const resolveTrainerChangeRequest = async ({
  requestId,
  action,
}: ResolveTrainerChangeRequestPayload) => {
  const response = await axiosInstance.post("/admin/backup-trainer/resolve-request", {
    requestId,
    action,
  });
  return response.data;
};

// Client: Assign backup trainer
export const assignBackupTrainer = async (): Promise<AssignBackupTrainerResponse> => {
  const response = await axiosInstance.post<AssignBackupTrainerResponse>(
    "/client/backup-trainer/assign"
  );
  return response.data;
};