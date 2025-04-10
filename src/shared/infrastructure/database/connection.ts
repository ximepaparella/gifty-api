import mongoose from 'mongoose';
import logger from '@shared/infrastructure/logging/logger';
import dotenv from 'dotenv';

dotenv.config();

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    // In newer versions of Mongoose, these options are no longer needed
    // They are set to true by default
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI environment variable is not defined');
    }

    logger.info('Connecting to MongoDB...');
    const connection = await mongoose.connect(mongoUri, options);
    logger.info('MongoDB connected successfully');

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully to Gifty cluster');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle process termination
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

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const getConnection = (): mongoose.Connection => mongoose.connection;
