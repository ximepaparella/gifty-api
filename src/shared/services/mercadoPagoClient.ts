import { MercadoPagoConfig } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN environment variable is required');
}

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN as string,
});

export default mercadoPagoClient; 