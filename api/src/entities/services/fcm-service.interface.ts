export interface IFCMService {
  sendPushNotification(userId: string, title: string, message: string): Promise<void>;
}