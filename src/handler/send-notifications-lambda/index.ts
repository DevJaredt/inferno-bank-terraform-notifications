import { SQSEvent } from "aws-lambda";
import { DynamoDbProvider } from "../../providers/dynamodb/dynamodb.provider";
import { v4 as uuidv4 } from "uuid";
import { MailerProvider } from "../../providers/mailer/mailer.provider";
import { IEvent } from "../../shared/interfaces/event.interface";
import { s3Provider } from "../../providers/s3/s3.provider";
import { TEMPLATE_KEY } from "../../shared/constants/template-key.constant";
import { compileTemplate } from "../../shared/templates/compile-template"
import handlebars from "handlebars";


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

      const getHtml = async (templateKey: string) => {
        const templateSource = await s3Provider.get(templateKey);
        return compileTemplate(templateSource, body.data);
      };

      switch (body.type) {
        case "WELCOME":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Welcome!",
            html: await getHtml(TEMPLATE_KEY.WELCOME),
          });
          break;
        case "USER.LOGIN":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Login report",
            html: await getHtml(TEMPLATE_KEY.LOGIN),
          });
          break;

        case "USER.UPDATE":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Data updated!",
            html: await getHtml(TEMPLATE_KEY.UPDATE),
          });
          break;

        case "CARD.CREATE":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Card created!",
            html: await getHtml(TEMPLATE_KEY.CARD_CREATE),
          });
          break;

        case "CARD.ACTIVATE":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Card activated!",
            html: await getHtml(TEMPLATE_KEY.CARD_ACTIVATE),
          });
          break;

        case "TRANSACTION.PURCHASE":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Purchase made!",
            html: await getHtml(TEMPLATE_KEY.TRANSACTION_PURCHASE),
          });
          break;
        case "TRANSACTION.SAVE":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Money saved!",
            html: await getHtml(TEMPLATE_KEY.TRANSACTION_SAVE),
          });
          break;
        case "TRANSACTION.PAID":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Payment made!",
            html: await getHtml(TEMPLATE_KEY.TRANSACTION_PAID),
          });
          break;
        case "REPORT.ACTIVITY":
          await MailerProvider.sendMail({
            ...mailInfo,
            subject: "Your activity report",
            html: await getHtml(TEMPLATE_KEY.REPORT_ACTIVITY),
          });
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.error("Error at send notification:", error);
    throw error;
  }
};
