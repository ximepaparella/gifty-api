import { createClient, RedisClientType } from 'redis';

// Define the Redis client with proper typing
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}) as unknown as RedisClientType;

redisClient.on('error', (err: Error) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export { redisClient, connectRedis };
