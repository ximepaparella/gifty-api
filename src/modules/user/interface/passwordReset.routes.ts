import express from 'express';
import * as passwordResetController from './passwordReset.controller';
import validateRequest from '@shared/infrastructure/middleware/validateRequest';
import passwordResetSchema from '../domain/passwordReset.schema';

const router = express.Router();

// Request password reset
router.post('/forgot-password',
  validateRequest(passwordResetSchema.requestReset),
  passwordResetController.requestPasswordReset
);

// Reset password with token
router.post('/reset-password/:token',
  validateRequest(passwordResetSchema.resetPassword),
  passwordResetController.resetPassword
);

export default router; 