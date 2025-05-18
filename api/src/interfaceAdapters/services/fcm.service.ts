import { injectable, inject } from 'tsyringe';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { IFCMService } from '@/entities/services/fcm-service.interface';
import { IClientRepository } from '@/entities/repositoryInterfaces/client/client-repository.interface';
import { ITrainerRepository } from '@/entities/repositoryInterfaces/trainer/trainer-repository.interface';
import { CustomError } from '@/entities/utils/custom.error';
import { HTTP_STATUS } from '@/shared/constants';

interface IFCMTokenHolder {
  fcmToken?: string;
}

@injectable()
export class FCMService implements IFCMService {
  constructor(
    @inject('IClientRepository') private clientModel: IClientRepository,
    @inject('ITrainerRepository') private trainerModel: ITrainerRepository
  ) {}

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      let user: IFCMTokenHolder | null = await this.clientModel.findById({ clientId: userId });
      if (!user) {
        user = await this.trainerModel.findById({ clientId: userId });
      }
      if (!user?.fcmToken) {
        return;
      }
      const fcmMessage: Message = {
        token: user.fcmToken,
        notification: { title, body: message },
      };
      await getMessaging().send(fcmMessage);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to send push notification',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}