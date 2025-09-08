import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { INotification } from '../../shared/interfaces/notification.interface';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbclient = new DynamoDBClient({ region: process.env.REGION! });
const tableName = process.env.NOTIFICATION_TABLE;

export const DynamoDbProvider = {
  save: async (notification: INotification): Promise<void> => {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: notification,
      });

      await dynamoDbclient.send(command);
    } catch (error) {
      console.error('Error at saving notification ', error);
      throw error;
    }
  },
};
