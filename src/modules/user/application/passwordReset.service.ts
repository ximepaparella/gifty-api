import { UserRepository } from '../domain/user.repository';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { generateToken } from '@shared/infrastructure/middleware/auth';
import logger from '@shared/infrastructure/logging/logger';
import { sendEmail } from '@shared/utils/email';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { hashPassword } from '@shared/utils/password';

export class PasswordResetService {
  constructor(private userRepository: UserRepository) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ErrorTypes.NOT_FOUND('User');
    }

    try {
      // Generate reset token
      const resetToken = generateToken({
        id: user.id!,
        email: user.email,
        role: user.role,
      });

      // Send email with reset link
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `Click here to reset your password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
      });
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw ErrorTypes.INTERNAL('Error sending email. Please try again later.');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token and get user info
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await this.userRepository.findById(decoded.id);

      if (!user) {
        throw ErrorTypes.NOT_FOUND('User');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user's password
      await this.userRepository.update(user.id!, { password: hashedPassword });
    } catch (error) {
      logger.error('Error resetting password:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw ErrorTypes.BAD_REQUEST('Token is invalid or has expired');
      }
      throw error;
    }
  }
}
