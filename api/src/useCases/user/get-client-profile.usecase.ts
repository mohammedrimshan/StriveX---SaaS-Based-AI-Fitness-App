import { inject, injectable } from 'tsyringe';
import { IClientRepository } from '@/entities/repositoryInterfaces/client/client-repository.interface';
import { IClientEntity } from '@/entities/models/client.entity';
import { CustomError } from '@/entities/utils/custom.error';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/shared/constants';
import { IGetClientProfileUseCase } from '@/entities/useCaseInterfaces/users/get-client-profile.usecase.interface';

@injectable()
export class GetClientProfileUseCase implements IGetClientProfileUseCase {
  constructor(
    @inject('IClientRepository')
    private clientRepository: IClientRepository,
  ) {}

  async execute(clientId: string): Promise<IClientEntity> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return client;
  }
}
