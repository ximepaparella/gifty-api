import nodemailer from 'nodemailer';
import { AppError } from '@shared/types/appError';
import logger from '@shared/infrastructure/logging/logger';

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

/**
 * Creates a nodemailer transporter using environment variables
 * @returns Nodemailer transporter
 */
export const createTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USERNAME,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Sends an email using nodemailer
 * @param options - Email options (recipient, subject, message, attachments)
 * @throws AppError if email sending fails
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Gift Voucher Platform" <noreply@giftvoucherplatform.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    };

    // Send email
    logger.info(`Sending email to ${options.to} with subject "${options.subject}"`);
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`);
  } catch (error: any) {
    logger.error(`Error sending email: ${error.message}`, error);
    throw new AppError(`Error sending email: ${error.message}`, 500);
  }
}; 