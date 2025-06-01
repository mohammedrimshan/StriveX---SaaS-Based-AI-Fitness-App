import { injectable, inject } from 'tsyringe';
import { IGetNotifications } from '@/entities/useCaseInterfaces/Notification/getnotification.usecase.interface';
import { INotificationRepository } from '@/entities/repositoryInterfaces/notification/notification-repository.interface';
import { INotificationEntity } from '@/entities/models/notification.entity';

@injectable()
export class GetNotifications implements IGetNotifications {
  constructor(
    @inject('INotificationRepository') private notificationRepository: INotificationRepository
  ) {}

  async execute(page: number = 1, limit: number = 10): Promise<INotificationEntity[]> {
    const skip = (page - 1) * limit;
    const { items } = await this.notificationRepository.find({}, skip, limit);
    return items;
  }
}