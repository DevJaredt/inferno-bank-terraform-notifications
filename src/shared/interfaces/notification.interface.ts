import { IEvent } from './event.interface';

export interface INotification {
  uuid: string;
  event: IEvent;
  createdAt: string;
}
