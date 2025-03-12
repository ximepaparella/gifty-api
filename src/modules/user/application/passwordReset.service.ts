import crypto from 'crypto';
import { AppError } from '@shared/types/appError';
import { UserModel } from '../infrastructure/user.model';
import { sendEmail } from '@shared/utils/email';

interface PasswordResetResult {
  status: string;
  message: string;
}

class PasswordResetService {
  async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    // 1) Get user based on email
    const user = await UserModel.findOne({ email, isDeleted: false });
    if (!user) {
      throw new AppError('No user found with that email address', 404);
    }

    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    const message = `
      Forgot your password? 
      Submit a request with your new password to: ${resetURL}
      If you didn't request this, please ignore this email.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 1 hour)',
        message
      });

      return {
        status: 'success',
        message: 'Password reset link sent to email'
      };
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('Error sending email. Please try again later.', 500);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    // 1) Get hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2) Get user based on token
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // 3) Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 4) Save user
    await user.save();

    return {
      status: 'success',
      message: 'Password successfully reset'
    };
  }
}

export default new PasswordResetService(); 