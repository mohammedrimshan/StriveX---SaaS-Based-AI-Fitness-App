import { Request, Response } from "express";

export interface IPostController {
    createPost(req: Request, res: Response): Promise<void>;
    getPosts(req: Request, res: Response): Promise<void>;
    getPost(req: Request, res: Response): Promise<void>;
    deletePost(req: Request, res: Response): Promise<void>;
    likePost(req: Request, res: Response): Promise<void>;
    reportPost(req: Request, res: Response): Promise<void>;
  }