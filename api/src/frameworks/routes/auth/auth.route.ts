import { Request, Response } from "express";
import { BaseRoute } from "../base.route";

export class AuthRoutes extends BaseRoute{
    constructor(){
        super()
    }
    protected initializeRoutes(): void {
        let router = this.router;
        router.get('/register',(req:Request,res:Response)=>{
            console.log("register route")
        })
       
    }
}

