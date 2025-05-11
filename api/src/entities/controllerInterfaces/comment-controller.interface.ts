import { Request, Response } from 'express';

export interface ICommentController {
    createComment(req: Request, res: Response): Promise<void>;
    likeComment(req: Request, res: Response): Promise<void>;
    deleteComment(req: Request, res: Response): Promise<void>;
    reportComment(req: Request, res: Response): Promise<void>;
  }