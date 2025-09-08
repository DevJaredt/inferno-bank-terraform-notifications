import { SQSEvent } from 'aws-lambda';
import { DynamoDbProvider } from '../../providers/dynamodb.provider';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const body = JSON.parse(record.body);

      await DynamoDbProvider.save({
        uuid: uuidv4(),
        event: body,
        createdAt: new Date().toDateString(),
      });
    }
  } catch (error) {
    console.error('Error at send notification:', error);
    throw error;
  }
};
