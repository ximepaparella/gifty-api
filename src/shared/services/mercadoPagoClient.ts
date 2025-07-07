import { MercadoPagoConfig } from 'mercadopago';

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN as string,
});

export default mercadoPagoClient; 