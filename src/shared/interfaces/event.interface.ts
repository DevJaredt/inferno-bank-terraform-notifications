import { NotificationType } from '../types/notification.type';

export interface IEvent {
  type: NotificationType;
  data: Record<string, any>;
}
