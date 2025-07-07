import { Request, Response } from 'express';
import mercadopagoClient from '@shared/services/mercadoPagoClient';
import { Payment } from 'mercadopago';
import { OrderModel } from '@modules/order/domain/order.schema';
import { OrderStatus } from '@modules/order/domain/order.entity';
import { sendEmail } from '@shared/utils/email';
import { logger } from '@shared/infrastructure/logging/logger';

export const processPayment = async (req: Request, res: Response) => {
  try {
    const {
      orderId, // Debe venir en el body para asociar el pago a la orden
      token,
      issuer_id,
      payment_method_id,
      transaction_amount,
      installments,
      payer
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    // Validación básica
    if (!token || !payment_method_id || !transaction_amount || !installments || !payer?.email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Buscar la orden existente
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Procesar el pago con Mercado Pago
    const payment = new Payment(mercadopagoClient);
    const paymentData: any = {
      transaction_amount: Number(transaction_amount),
      token,
      description: 'Gifty Payment',
      installments: Number(installments),
      payment_method_id,
      payer: { email: payer.email },
    };
    // Solo incluir issuer_id si es un número válido
    if (issuer_id && !isNaN(Number(issuer_id))) {
      paymentData.issuer_id = Number(issuer_id);
    }

    const mpResponse = await payment.create({ body: paymentData });
    const { status, status_detail, id: mp_payment_id, payment_method_id: mp_method_id, transaction_amount: mp_amount, installments: mp_installments, payer: mp_payer } = mpResponse;

    // Actualizar campos de pago genéricos y específicos
    order.paymentDetails = {
      paymentId: String(mp_payment_id),
      status: status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : 'pending',
      paymentEmail: String(payer.email),
      amount: Number(transaction_amount),
      provider: 'mercadopago',
      currency: 'ARS', // O la que corresponda
      paymentMethod: String(payment_method_id),
      transactionId: String(mp_payment_id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    order.mercadoPagoInfo = {
      mp_payment_id: String(mp_payment_id),
      status: String(status),
      status_detail: String(status_detail),
      payment_method_id: String(mp_method_id),
      transaction_amount: Number(mp_amount),
      installments: Number(mp_installments),
      payer_email: String(mp_payer?.email || payer.email),
    };

    // Actualizar estado de la orden
    if ('status' in order) {
      if (status === 'approved') {
        order.status = 'completed';
        // Aquí puedes llamar a la lógica de generación de voucher y envío de correos al cliente
        // await sendVoucherAndEmails(order);
      } else if (status === 'rejected') {
        order.status = 'failed';
        // Notificar al Store Manager sobre el pago rechazado
        await sendEmail({
          to: 'storemanager@example.com', // Reemplazar por el email real del store
          subject: 'Orden rechazada en Gifty',
          text: `La orden ${order._id} fue rechazada por Mercado Pago.`,
        });
      } else {
        order.status = 'pending';
        // Notificar al Store Manager sobre la orden pendiente de pago
        await sendEmail({
          to: 'storemanager@example.com', // Reemplazar por el email real del store
          subject: 'Orden pendiente de pago en Gifty',
          text: `La orden ${order._id} está pendiente de pago.`,
        });
      }
    }

    await order.save();

    return res.status(200).json({
      status,
      status_detail,
      id: mp_payment_id,
    });
  } catch (error: any) {
    logger.error('Error en processPayment:', {
      error: error,
      message: error?.message,
      stack: error?.stack,
      mpError: error?.cause || error?.response || null
    });
    let clientMessage = 'Internal server error';
    if (error?.message) clientMessage = error.message;
    if (error?.cause?.response?.data) clientMessage = error.cause.response.data;
    if (error?.response?.data) clientMessage = error.response.data;
    return res.status(500).json({
      error: clientMessage,
    });
  }
}; 