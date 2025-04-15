import nodemailer from 'nodemailer';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';

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
 * @throws AppError if email configuration is invalid
 */
export const createTransporter = (): nodemailer.Transporter => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw ErrorTypes.INTERNAL('Email configuration is incomplete');
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user,
      pass,
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
    logger.info(`Sending email to ${options.to}`);

    if (!options.to) {
      throw ErrorTypes.VALIDATION('Recipient email is required');
    }

    if (!options.subject) {
      throw ErrorTypes.VALIDATION('Email subject is required');
    }

    if (!options.html && !options.text) {
      throw ErrorTypes.VALIDATION('Email content (html or text) is required');
    }

    const transporter = createTransporter();

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Gift Voucher Platform" <noreply@giftvoucherplatform.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    // Send email
    logger.info(`Sending email to ${options.to} with subject "${options.subject}"`);
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, { messageId: info.messageId });
  } catch (error: unknown) {
    logger.error('Error sending email:', error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      throw ErrorTypes.INTERNAL(`Error sending email: ${error.message}`);
    }

    throw ErrorTypes.INTERNAL('Unknown error occurred while sending email');
  }
};
