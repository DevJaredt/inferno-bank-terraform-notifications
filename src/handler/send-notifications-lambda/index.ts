import { SQSEvent, SQSHandler, Context } from "aws-lambda";

export const handler: SQSHandler = async (
  event: SQSEvent,
  context: Context
) => {
  console.log("Lambda invocation ID:", context.awsRequestId);
  console.log("Event received:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Processing message ID: ${record.messageId}`);
      console.log("Message body:", record.body);

      // Tu lógica aquí

      console.log(`[${timestamp}] Message processed successfully`);
    }
  } catch (error) {
    console.error("Error processing message:", error);
    throw error; // Esto asegura que el mensaje vaya a la DLQ
  }
};
