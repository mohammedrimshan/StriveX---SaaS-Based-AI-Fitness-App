import { IClientEntity } from '@/entities/models/client.entity';

export interface IGetClientProfileUseCase {
  execute(clientId: string): Promise<IClientEntity>;
}
