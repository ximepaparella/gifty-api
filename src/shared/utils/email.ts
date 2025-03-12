import nodemailer from 'nodemailer';
import { AppError } from '@shared/types/appError';

/**
 * Email options interface
 */
interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

/**
 * Creates a nodemailer transporter using environment variables
 * @returns Nodemailer transporter
 */
const createTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Sends an email using nodemailer
 * @param options - Email options (recipient, subject, message)
 * @throws AppError if email sending fails
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.message.replace(/\n/g, '<br>')
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError('Error sending email. Please try again later.', 500);
  }
}; 