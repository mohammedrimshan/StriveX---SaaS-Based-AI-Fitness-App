
import { clientAxiosInstance } from "@/api/client.axios";
import { trainerAxiosInstance } from "@/api/trainer.axios";
import { GetBackupTrainerInvitationsResponse, GetTrainerChangeRequestsResponse, RespondToInvitationPayload, SubmitTrainerChangeRequestPayload, TrainerBackupInvitationResponse, TrainerChangeRequestResponse } from "@/types/backuptrainer";
export const getClientBackupInvitations = async (
  page: number = 1,
  limit: number = 10
): Promise<GetBackupTrainerInvitationsResponse> => {
  const response = await clientAxiosInstance.get<GetBackupTrainerInvitationsResponse>(
    `/client/backup-trainer/invitations?page=${page}&limit=${limit}`
  );

  return response.data;
};

export const getClientTrainerChangeRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<GetTrainerChangeRequestsResponse> => {
  const response = await clientAxiosInstance.get<GetTrainerChangeRequestsResponse>(
    `/client/backup-trainer/getrequests?page=${page}&limit=${limit}`
  );

  return response.data;
};

export const submitTrainerChangeRequest = async (
  payload: SubmitTrainerChangeRequestPayload
): Promise<TrainerChangeRequestResponse> => {
  const response = await clientAxiosInstance.post<TrainerChangeRequestResponse>(
    "/client/backup-trainer/request",
    payload
  );

  return response.data;
};


export const getTrainerBackupInvitations = async (page = 1, limit = 10): Promise<TrainerBackupInvitationResponse> => {
  const response = await trainerAxiosInstance.get<TrainerBackupInvitationResponse>(
    `/trainer/backup-trainer/invitation?page=${page}&limit=${limit}`
  );
  return response.data;
};



export const respondToBackupInvitation = async (
  payload: RespondToInvitationPayload
): Promise<any> => {
  const response = await trainerAxiosInstance.post(
    "/trainer/backup-trainer/invitation",
    payload
  );
  return response.data;
};



export const getTrainerBackupClients = async (page = 1, limit = 10) => {
  const response = await trainerAxiosInstance.get("/trainer/backup-trainer/clients", {
    params: { page, limit },
  });
  return response.data;
};