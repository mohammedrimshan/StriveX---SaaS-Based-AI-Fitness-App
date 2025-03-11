import { ControllerRegistry } from "./constroller.registry";

export class DependancyInjection{
    static registerAll():void{
        ControllerRegistry.registerController();
    }
}