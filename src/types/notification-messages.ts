export type NotificationType =
  | 'WELCOME'
  | 'USER.LOGIN'
  | 'USER.UPDATE'
  | 'CARD.CREATE'
  | 'CARD.ACTIVATE'
  | 'TRANSACTION.PURCHASE'
  | 'TRANSACTION.SAVE'
  | 'TRANSACTION.PAID'
  | 'REPORT.ACTIVITY';

export interface INotification {
  uuid: string;
  event: {
    type: NotificationType;
    data: Record<string, string | number>;
  };
  createdAt: string;
}
