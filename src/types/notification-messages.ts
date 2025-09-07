export type NotificationType =
  | "WELCOME"
  | "USER.LOGIN"
  | "USER.UPDATE"
  | "CARD.CREATE"
  | "CARD.ACTIVATE"
  | "TRANSACTION.PURCHASE"
  | "TRANSACTION.SAVE"
  | "TRANSACTION.PAID"
  | "REPORT.ACTIVITY";

export interface BaseNotificationMessage {
  type: NotificationType;
  email: string;
  userId: string;
  timestamp: string;
  requestId: string;
}

export interface WelcomeMessage extends BaseNotificationMessage {
  type: "WELCOME";
  data: {
    userName: string;
  };
}
