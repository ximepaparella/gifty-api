import { Router } from 'express';
import { processPayment } from './payment.controller';

const router = Router();

router.post('/process_payment', processPayment);

export default router; 