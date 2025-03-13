import { Request,Response } from "express";

export interface IRegisterUserController{
    handle(req:Request,res:Response):Promise<void>;
}