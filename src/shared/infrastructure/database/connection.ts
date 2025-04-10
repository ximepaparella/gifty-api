import mongoose from 'mongoose';
import logger from '@shared/infrastructure/logging/logger';
import dotenv from 'dotenv';
import { ErrorTypes } from '@shared/types/appError';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw ErrorTypes.INTERNAL('MONGO_URI or MONGODB_URI environment variable is not defined');
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error('Error connecting to MongoDB:', error);
    throw ErrorTypes.INTERNAL(`MongoDB connection failed: ${error.message}`);
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error: any) {
    logger.error('Error closing MongoDB connection:', error);
    throw ErrorTypes.INTERNAL(`Failed to close MongoDB connection: ${error.message}`);
  }
};

export const getConnection = (): mongoose.Connection => mongoose.connection;
