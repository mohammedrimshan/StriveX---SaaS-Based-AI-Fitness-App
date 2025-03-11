import { container } from "tsyringe";


//*===== Controller Imports ======*//
import { RegisterUserController } from "@/interfaceAdapters/controllers/auth/register.controller";



export class ControllerRegistry{
    static registerController():void{
        container.register("RegisterUserController",{
            useClass : RegisterUserController
        })
    }
}