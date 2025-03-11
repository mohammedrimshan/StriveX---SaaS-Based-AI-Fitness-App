import { container } from "tsyringe";

import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ClientRepository } from "@/interfaceAdapters/repositories/client/client.repository";

export class RepositoryRegistry{
    static registerRepositories():void{
        container.register<IClientRepository>("IClientRepository",{
            useClass:ClientRepository
        })

        
    }
}