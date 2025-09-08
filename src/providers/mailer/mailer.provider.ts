import nodemailer from 'nodemailer';
import { IMail } from '../../shared/interfaces/mail.interface';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const MailerProvider = {
  sendMail: async (mail: IMail): Promise<void> => {
    try {
      await transporter.sendMail(mail);
    } catch (error) {
      console.error('Error at sending mail: ', error);
      throw error;
    }
  },
};
