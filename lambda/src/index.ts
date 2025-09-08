import { SQSEvent, SQSHandler, Context } from "aws-lambda";

export const handler: SQSHandler = async (
  event: SQSEvent,
  context: Context
) => {
  const invocationId = context.awsRequestId;
  console.log(
    `[${invocationId}] Lambda started at ${new Date().toISOString()}`
  );
  console.log(`[${invocationId}] Event:`, JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      console.log(`[${invocationId}] Processing message ${record.messageId}`);
      console.log(`[${invocationId}] Message body:`, record.body);

      // Procesar el mensaje
      const messageBody = JSON.parse(record.body);
      await processMessage(messageBody, invocationId);

      console.log(
        `[${invocationId}] Message ${record.messageId} processed successfully`
      );
    }

    console.log(
      `[${invocationId}] Lambda finished successfully at ${new Date().toISOString()}`
    );
    return { batchItemFailures: [] };
  } catch (error) {
    console.error(`[${invocationId}] Error:`, error);
    throw error;
  }
};

async function processMessage(
  message: any,
  invocationId: string
): Promise<void> {
  console.log(
    `[${invocationId}] Processing message details:`,
    JSON.stringify(message, null, 2)
  );
  // Tu lógica de procesamiento aquí
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simular procesamiento
}
