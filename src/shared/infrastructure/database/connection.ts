import mongoose from 'mongoose';
import { logger } from '@shared/infrastructure/logging/logger';
import dotenv from 'dotenv';
import { ErrorTypes } from '@shared/types/appError';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw ErrorTypes.INTERNAL('MONGO_URI or MONGODB_URI environment variable is not defined');
}

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 50,
  retryWrites: true,
  w: 'majority'
} as mongoose.ConnectOptions;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(MONGO_URI, mongooseOptions);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error connecting to MongoDB:', { error: errorMessage });
    throw ErrorTypes.INTERNAL(`MongoDB connection failed: ${errorMessage}`);
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error closing MongoDB connection:', { error: errorMessage });
    throw ErrorTypes.INTERNAL(`Failed to close MongoDB connection: ${errorMessage}`);
  }
};

export const getConnection = (): mongoose.Connection => mongoose.connection;
