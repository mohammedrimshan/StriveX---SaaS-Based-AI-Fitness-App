export interface INotificationEntity {
  id?: string;
  userId: string; 
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  actionLink?:string, 
  relatedEntityId?:string, 
  createdAt: Date;
   _id?: string;
}