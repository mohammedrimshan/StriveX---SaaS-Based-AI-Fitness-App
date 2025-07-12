import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IBackupTrainerController } from "@/entities/controllerInterfaces/backuptrainercontroller.interface";
import { IAssignBackupTrainerUseCase } from "@/entities/useCaseInterfaces/backtrainer/assign-backup-trainer.usecase.interface";
import { IAcceptRejectBackupInvitationUseCase } from "@/entities/useCaseInterfaces/backtrainer/accept-reject-backup-invitation.usecase.interface";
import { IRequestBackupTrainerChangeUseCase } from "@/entities/useCaseInterfaces/backtrainer/request-backup-trainer-change.usecase.interface";
import { IResolveBackupTrainerChangeRequestUseCase } from "@/entities/useCaseInterfaces/backtrainer/resolve-backup-trainer-change-request.usecase";
import { CustomError } from "@/entities/utils/custom.error";
import {
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/shared/constants";
import { handleErrorResponse } from "@/shared/utils/errorHandler";
import { CustomRequest } from "../middlewares/auth.middleware";
import { IGetClientBackupTrainerUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-backup-trainer-usecase.interface";
import { IGetTrainerBackupInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-trainer-backup-invitations-usecase.interface";
import { IGetTrainerBackupClientsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-trainer-backup-clients-usecase.interface";
import { IGetPendingChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-pending-change-requests-usecase.interface";
import { IGetClientChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-change-requests-usecase.interface";
import { IGetClientBackupInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-backup-invitations-usecase.interface";
import { IGetAllChangeRequestsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-all-change-requests-usecase.interface";
import { IGetClientsBackupOverviewUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-clients-backup-overview-usecase.interface";

@injectable()
export class BackupTrainerController implements IBackupTrainerController {
  constructor(
    @inject("IAssignBackupTrainerUseCase")
    private assignBackupTrainerUseCase: IAssignBackupTrainerUseCase,
    @inject("IAcceptRejectBackupInvitationUseCase")
    private acceptRejectInvitationUseCase: IAcceptRejectBackupInvitationUseCase,
    @inject("IRequestBackupTrainerChangeUseCase")
    private requestBackupTrainerChangeUseCase: IRequestBackupTrainerChangeUseCase,
    @inject("IResolveBackupTrainerChangeRequestUseCase")
    private resolveChangeRequestUseCase: IResolveBackupTrainerChangeRequestUseCase,
    @inject("IGetClientBackupTrainerUseCase")
    private getClientBackupTrainerUseCase: IGetClientBackupTrainerUseCase,
    @inject("IGetTrainerBackupInvitationsUseCase")
    private getTrainerBackupInvitationsUseCase: IGetTrainerBackupInvitationsUseCase,
    @inject("IGetTrainerBackupClientsUseCase")
    private getTrainerBackupClientsUseCase: IGetTrainerBackupClientsUseCase,
    @inject("IGetPendingChangeRequestsUseCase")
    private getPendingChangeRequestsUseCase: IGetPendingChangeRequestsUseCase,
    @inject("IGetClientChangeRequestsUseCase")
    private getClientChangeRequestsUseCase: IGetClientChangeRequestsUseCase,
    @inject("IGetClientBackupInvitationsUseCase")
    private getClientBackupInvitationsUseCase: IGetClientBackupInvitationsUseCase,
    @inject("IGetAllChangeRequestsUseCase")
    private getAllChangeRequestsUseCase: IGetAllChangeRequestsUseCase,
    @inject("IGetClientsBackupOverviewUseCase")
    private getClientsBackupOverviewUseCase: IGetClientsBackupOverviewUseCase
  ) {}

  async assignBackupTrainer(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      if (!clientId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const client = await this.assignBackupTrainerUseCase.execute(clientId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.BACKUP_TRAINER_ASSIGNMENT_INITIATED,
        client,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async acceptRejectBackupInvitation(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const trainerId = (req as CustomRequest).user.id;
      const { invitationId, action } = req.body;

      if (!trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!invitationId || !["accept", "reject"].includes(action)) {
        throw new CustomError(
          "Invalid invitation ID or action",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const client = await this.acceptRejectInvitationUseCase.execute(
        invitationId,
        trainerId,
        action
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.BACKUP_INVITATION_UPDATED,
        client,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async requestBackupTrainerChange(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;

      const { requestType, reason } = req.body;

      if (!clientId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!["CHANGE", "REVOKE"].includes(requestType)) {
        throw new CustomError("Invalid request type", HTTP_STATUS.BAD_REQUEST);
      }

      const request = await this.requestBackupTrainerChangeUseCase.execute(
        clientId,
        requestType,
        reason
      );
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REQUEST_SUBMITTED,
        request,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async resolveChangeRequest(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as CustomRequest).user.id;
      const { requestId, action } = req.body;

      if (!adminId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (!requestId || !["approve", "reject"].includes(action)) {
        throw new CustomError(
          "Invalid request ID or action",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const request = await this.resolveChangeRequestUseCase.execute(
        requestId,
        adminId,
        action
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.REQUEST_RESOLVED,
        request,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getClientBackupTrainer(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.clientId;
      if (!clientId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const client = await this.getClientBackupTrainerUseCase.execute(clientId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        client,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getTrainerBackupInvitations(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const trainerId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getTrainerBackupInvitationsUseCase.execute(
          trainerId,
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        invitations: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalInvitations: items.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getTrainerBackupClients(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!trainerId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getTrainerBackupClientsUseCase.execute(
          trainerId,
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        clients: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalClients: items.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getPendingChangeRequests(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!adminId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getPendingChangeRequestsUseCase.execute(
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        requests: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalRequests: items.length,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getClientChangeRequests(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!clientId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getClientChangeRequestsUseCase.execute(
          clientId,
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        requests: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalRequests: total,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getClientBackupInvitations(req: Request, res: Response): Promise<void> {
    try {
      const clientId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!clientId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getClientBackupInvitationsUseCase.execute(
          clientId,
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        invitations: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalInvitations: total,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getAllChangeRequests(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10, status } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!adminId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } = await this.getAllChangeRequestsUseCase.execute(
        (pageNumber - 1) * pageSize,
        pageSize,
        status as string
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        requests: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalRequests: total,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }

  async getClientsBackupOverview(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as CustomRequest).user.id;
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = Number(page);
      const pageSize = Number(limit);

      if (!adminId) {
        throw new CustomError(
          ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      if (
        isNaN(pageNumber) ||
        isNaN(pageSize) ||
        pageNumber < 1 ||
        pageSize < 1
      ) {
        throw new CustomError(
          "Invalid pagination parameters",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const { items, total } =
        await this.getClientsBackupOverviewUseCase.execute(
          (pageNumber - 1) * pageSize,
          pageSize
        );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        clients: items,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        totalClients: total,
      });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  }
}
