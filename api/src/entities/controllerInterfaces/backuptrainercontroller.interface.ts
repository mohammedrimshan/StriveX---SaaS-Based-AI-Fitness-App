import { Request, Response } from "express";

export interface IBackupTrainerController {
  assignBackupTrainer(req: Request, res: Response): Promise<void>;
  acceptRejectBackupInvitation(req: Request, res: Response): Promise<void>;
  requestBackupTrainerChange(req: Request, res: Response): Promise<void>;
  resolveChangeRequest(req: Request, res: Response): Promise<void>;
  getClientBackupTrainer(req: Request, res: Response): Promise<void>;
  getTrainerBackupInvitations(req: Request, res: Response): Promise<void>;
  getTrainerBackupClients(req: Request, res: Response): Promise<void>;
  getPendingChangeRequests(req: Request, res: Response): Promise<void>;
  getClientChangeRequests(req: Request, res: Response): Promise<void>;
  getClientBackupInvitations(req: Request, res: Response): Promise<void>;
  getAllChangeRequests(req: Request, res: Response): Promise<void>;
  getClientsBackupOverview(req: Request, res: Response): Promise<void>;
}
