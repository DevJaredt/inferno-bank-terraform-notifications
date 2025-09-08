import { SQSEvent } from 'aws-lambda';
import { DynamoDbProvider } from '../../providers/dynamodb/dynamodb.provider';
import { v4 as uuidv4 } from 'uuid';
import { MailerProvider } from '../../providers/mailer/mailer.provider';
import { IEvent } from '../../shared/interfaces/event.interface';
import { s3Provider } from '../../providers/s3/s3.provider';
import { TEMPLATE_KEY } from '../../shared/constants/template-key.constant';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const body: IEvent = JSON.parse(record.body);

      await DynamoDbProvider.save({
        uuid: uuidv4(),
        event: body,
        createdAt: new Date().toDateString(),
      });

      const mailInfo = {
        from: process.env.smtp_user!,
        to: body.data.email!,
      };

      switch (body.type) {
        case 'WELCOME':
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: 'Welcome!',
            html: await s3Provider.get(TEMPLATE_KEY.WELCOME),
          });
          break;
        case 'USER.LOGIN':
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: 'Login report',
            html: await s3Provider.get(TEMPLATE_KEY.LOGIN),
          });
          break;

        case 'USER.UPDATE':
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: 'Data updated!',
            html: await s3Provider.get(TEMPLATE_KEY.UPDATE),
          });
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.error('Error at send notification:', error);
    throw error;
  }
};
