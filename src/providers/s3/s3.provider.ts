import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.REGION! });

export const s3Provider = {
  get: async (key: string): Promise<string> => {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.TEMPLATES_BUCKET,
        Key: key,
      });

      const res = await s3Client.send(command);

      if (!res.Body) throw new Error('Object not found');

      return res.Body.transformToString();
    } catch (error) {
      console.error('Error at getting object');
      throw error;
    }
  },
};
