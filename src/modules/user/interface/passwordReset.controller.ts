import { Request, Response } from 'express';
import passwordResetService from '../application/passwordReset.service';
import { catchAsync } from '@shared/utils';

export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const result = await passwordResetService.requestPasswordReset(req.body.email);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await passwordResetService.resetPassword(token, password);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});
