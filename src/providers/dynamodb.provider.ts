import { INotification } from '../types/notification-messages';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbclient = new DynamoDBClient({ region: 'us-west-1' });
const tableName = 'notification-table';

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
