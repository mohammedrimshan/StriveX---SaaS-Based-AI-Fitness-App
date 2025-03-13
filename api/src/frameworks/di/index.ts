import { ControllerRegistry } from "./constroller.registry";
import { RepositoryRegistry } from "./repository.registry";
import { UseCaseRegistry } from "./usecase.registry";
export class DependancyInjection{
    static registerAll():void{
        ControllerRegistry.registerController();
        RepositoryRegistry.registerRepositories();
        UseCaseRegistry.registerUseCases();
    }
}