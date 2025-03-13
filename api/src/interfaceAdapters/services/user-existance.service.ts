import { inject, injectable } from "tsyringe";
import { IUserExistenceService } from "../../entities/services/user-exist-service.interface";
import { IClientRepository } from './../../entities/repositoryInterfaces/client/client-repository.interface';

@injectable()
export class UserExistenceService implements IUserExistenceService {
   constructor(
      @inject("IClientRepository") private clientRepo:IClientRepository
   ) {}

   async emailExists(email: string): Promise<boolean> {
       const [client] = await Promise.all([
         this.clientRepo.findByEmail(email)
       ])

       return Boolean(client)
   }
}