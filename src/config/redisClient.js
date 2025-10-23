import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

try {
    await redisClient.connect();
    console.log('Successfully connected to Redis!');
} catch (err) {
    console.error('Could not connect to Redis:', err);
}

export const redis = redisClient;